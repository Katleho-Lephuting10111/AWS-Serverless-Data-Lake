#!/bin/bash

# ============================================
# Frontend Deployment Script
# Deploys React build to AWS S3 with CloudFront invalidation
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="${FRONTEND_DIR:-./Frontend}"
S3_BUCKET="${S3_BUCKET:-student-datalake-frontend}"
CLOUDFRONT_DIST_ID="${CLOUDFRONT_DIST_ID:-}"
REGION="${AWS_REGION:-eu-west-1}"

# ============================================
# Helper Functions
# ============================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_banner() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║           Frontend Deployment Script                       ║"
    echo "║           Student DataLake Platform                        ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# ============================================
# Prerequisites Check
# ============================================

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    local missing_deps=()
    
    # Check for Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    else
        log_success "Node.js version: $(node --version)"
    fi
    
    # Check for npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    else
        log_success "npm version: $(npm --version)"
    fi
    
    # Check for AWS CLI
    if ! command -v aws &> /dev/null; then
        log_warning "AWS CLI not found - S3 sync will be skipped"
        AWS_CLI_AVAILABLE=false
    else
        log_success "AWS CLI version: $(aws --version)"
        AWS_CLI_AVAILABLE=true
        
        # Check AWS credentials
        if ! aws sts get-caller-identity &> /dev/null; then
            log_warning "AWS credentials not configured or invalid"
            AWS_CLI_AVAILABLE=false
        else
            log_success "AWS credentials validated"
        fi
    fi
    
    # Check if frontend directory exists
    if [ ! -d "$FRONTEND_DIR" ]; then
        missing_deps+=("$FRONTEND_DIR directory not found")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing prerequisites:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        return 1
    fi
    
    log_success "All prerequisites met!"
    return 0
}

# ============================================
# Build Frontend
# ============================================

build_frontend() {
    log_info "Building frontend application..."
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log_info "Installing dependencies..."
        npm install
    fi
    
    # Run build
    log_info "Running production build..."
    npm run build
    
    if [ ! -d "dist" ]; then
        log_error "Build failed - dist directory not found"
        return 1
    fi
    
    log_success "Frontend build completed!"
    
    # Print build info
    echo ""
    log_info "Build statistics:"
    echo "  Build directory: $(pwd)/dist"
    echo "  Total files: $(find dist -type f | wc -l)"
    echo "  Total size: $(du -sh dist | cut -f1)"
    echo ""
    
    cd - > /dev/null
    return 0
}

# ============================================
# Deploy to S3
# ============================================

deploy_to_s3() {
    if [ "$AWS_CLI_AVAILABLE" = false ]; then
        log_warning "Skipping S3 deployment - AWS CLI not available"
        return 0
    fi
    
    log_info "Deploying to S3 bucket: $S3_BUCKET"
    
    # Check if bucket exists
    if ! aws s3api head-bucket --bucket "$S3_BUCKET" &> /dev/null; then
        log_warning "S3 bucket '$S3_BUCKET' does not exist"
        log_info "Creating bucket..."
        aws s3 mb s3://$S3_BUCKET --region $REGION 2>/dev/null || \
        aws s3 mb s3://$S3_BUCKET 2>/dev/null || true
        
        # Configure bucket for static hosting
        aws s3 website s3://$S3_BUCKET \
            --index-document index.html \
            --error-document index.html
    fi
    
    # Sync with cache control for production
    log_info "Uploading files to S3..."
    aws s3 sync "$FRONTEND_DIR/dist/" "s3://$S3_BUCKET" \
        --delete \
        --cache-control "max-age=31536000" \
        --region $REGION
    
    # Set shorter cache for HTML files
    aws s3 cp "$FRONTEND_DIR/dist/index.html" "s3://$S3_BUCKET/index.html" \
        --cache-control "max-age=0, no-cache, no-store, must-revalidate" \
        --region $REGION
    
    log_success "Files deployed to S3!"
    
    # Print website URL
    echo ""
    log_info "S3 Website URL:"
    echo "  http://$S3_BUCKET.s3-website-$REGION.amazonaws.com"
    echo "  http://$S3_BUCKET.s3-website.${REGION}.amazonaws.com"
    
    return 0
}

# ============================================
# Invalidate CloudFront
# ============================================

invalidate_cloudfront() {
    if [ -z "$CLOUDFRONT_DIST_ID" ]; then
        log_info "CloudFront distribution ID not provided - skipping invalidation"
        return 0
    fi
    
    if [ "$AWS_CLI_AVAILABLE" = false ]; then
        log_warning "Skipping CloudFront invalidation - AWS CLI not available"
        return 0
    fi
    
    log_info "Invalidating CloudFront distribution: $CLOUDFRONT_DIST_ID"
    
    # Create invalidation
    local invalidation_id=$(aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DIST_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    log_success "CloudFront invalidation created: $invalidation_id"
    
    # Wait for invalidation to complete
    log_info "Waiting for invalidation to complete..."
    aws cloudfront wait invalidation-completed \
        --distribution-id "$CLOUDFRONT_DIST_ID" \
        --id "$invalidation_id"
    
    log_success "CloudFront cache invalidated!"
    
    return 0
}

# ============================================
# Print Deployment Summary
# ============================================

print_summary() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                   Deployment Complete!                    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Resources:"
    echo "  • Frontend:  $FRONTEND_DIR"
    echo "  • S3 Bucket: $S3_BUCKET"
    echo ""
    echo "Access URLs:"
    echo "  • S3 Website: http://$S3_BUCKET.s3-website-$REGION.amazonaws.com"
    echo ""
    
    if [ -n "$CLOUDFRONT_DIST_ID" ]; then
        local cf_domain=$(aws cloudfront get-distribution \
            --id "$CLOUDFRONT_DIST_ID" \
            --query 'Distribution.DomainName' \
            --output text 2>/dev/null || echo "NOT_FOUND")
        echo "  • CloudFront: https://$cf_domain"
        echo ""
    fi
    
    echo "Next Steps:"
    echo "  1. Test the application in your browser"
    echo "  2. Configure custom domain (Route 53)"
    echo "  3. Set up CI/CD pipeline for automatic deployments"
    echo ""
}

# ============================================
# Main Execution
# ============================================

main() {
    print_banner
    
    # Parse arguments
    local skip_build=false
    local skip_s3=false
    local skip_cf=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-build)
                skip_build=true
                shift
                ;;
            --skip-s3)
                skip_s3=true
                shift
                ;;
            --skip-cf)
                skip_cf=true
                shift
                ;;
            --bucket)
                S3_BUCKET="$2"
                shift 2
                ;;
            --dist-id)
                CLOUDFRONT_DIST_ID="$2"
                shift 2
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-build     Skip building the frontend"
                echo "  --skip-s3        Skip S3 deployment"
                echo "  --skip-cf        Skip CloudFront invalidation"
                echo "  --bucket NAME    S3 bucket name (default: student-datalake-frontend)"
                echo "  --dist-id ID     CloudFront distribution ID"
                echo "  --help, -h       Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run deployment steps
    if [ "$skip_build" = false ]; then
        check_prerequisites || exit 1
        build_frontend || exit 1
    fi
    
    if [ "$skip_s3" = false ]; then
        deploy_to_s3 || exit 1
    fi
    
    if [ "$skip_cf" = false ]; then
        invalidate_cloudfront || exit 1
    fi
    
    print_summary
}

# Run main function
main "$@"

