# ============================================
# Student Data Lake - Example Athena SQL Queries
# ============================================
# These queries are optimized for Chart.js visualizations
# Compatible with: student_db database
# ============================================

# ============================================
# 1. GPA vs. Social Media Usage
# ============================================

-- Bar Chart: Average GPA by Platform
-- Shows which social media platform has highest/lowest academic impact
SELECT 
    platform,
    AVG(gpa) as avg_gpa,
    AVG(hours_per_day) as avg_hours,
    COUNT(*) as student_count
FROM student_social_media_usage
WHERE gpa IS NOT NULL AND hours_per_day IS NOT NULL
GROUP BY platform
ORDER BY avg_gpa DESC

-- Scatter Chart: Correlation between GPA and Social Media Hours
-- Perfect for showing negative correlation
SELECT 
    student_id,
    AVG(hours_per_day) as social_media_hours,
    AVG(gpa) as gpa
FROM student_social_media_usage
WHERE gpa IS NOT NULL AND hours_per_day IS NOT NULL
GROUP BY student_id
HAVING COUNT(*) >= 1
LIMIT 500

-- Bar Chart: GPA Distribution Ranges
SELECT 
    CASE 
        WHEN gpa >= 3.5 THEN '3.5-4.0 (Excellent)'
        WHEN gpa >= 3.0 THEN '3.0-3.4 (Good)'
        WHEN gpa >= 2.5 THEN '2.5-2.9 (Average)'
        WHEN gpa >= 2.0 THEN '2.0-2.4 (Below Average)'
        ELSE 'Below 2.0 (At Risk)'
    END as gpa_range,
    COUNT(*) as student_count,
    AVG(hours_per_day) as avg_social_media_hours
FROM student_social_media_usage
WHERE gpa IS NOT NULL
GROUP BY 1
ORDER BY 
    CASE gpa_range
        WHEN 'Below 2.0 (At Risk)' THEN 1
        WHEN '2.0-2.4 (Below Average)' THEN 2
        WHEN '2.5-2.9 (Average)' THEN 3
        WHEN '3.0-3.4 (Good)' THEN 4
        WHEN '3.5-4.0 (Excellent)' THEN 5
    END

-- Line Chart: GPA Trend by Age/Year
SELECT 
    student_year as academic_year,
    AVG(gpa) as avg_gpa,
    AVG(hours_per_day) as avg_social_media_hours
FROM student_social_media_usage
WHERE gpa IS NOT NULL
GROUP BY student_year
ORDER BY 
    CASE student_year
        WHEN 'Freshman' THEN 1
        WHEN 'Sophomore' THEN 2
        WHEN 'Junior' THEN 3
        WHEN 'Senior' THEN 4
        WHEN 'Graduate' THEN 5
    END


# ============================================
# 2. Sleep vs. Stress Analysis
# ============================================

-- Scatter Chart: Sleep Hours vs. Stress Level
SELECT 
    student_id,
    AVG(sleep_hours) as sleep_hours,
    AVG(stress_level) as stress_level,
    AVG(mental_health_score) as mental_health
FROM student_sleep_stress
WHERE sleep_hours IS NOT NULL AND stress_level IS NOT NULL
GROUP BY student_id
LIMIT 500

-- Bar Chart: Average Sleep Hours by Day of Week
SELECT 
    day_of_week,
    AVG(sleep_hours) as avg_sleep,
    AVG(stress_level) as avg_stress
FROM student_sleep_stress
WHERE day_of_week IS NOT NULL
GROUP BY day_of_week
ORDER BY 
    CASE day_of_week
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
    END

-- Pie Chart: Stress Level Distribution
SELECT 
    CASE 
        WHEN stress_level >= 8 THEN 'Very High (8-10)'
        WHEN stress_level >= 6 THEN 'High (6-7)'
        WHEN stress_level >= 4 THEN 'Moderate (4-5)'
        WHEN stress_level >= 2 THEN 'Low (2-3)'
        ELSE 'Very Low (0-1)'
    END as stress_category,
    COUNT(*) as student_count,
    AVG(sleep_hours) as avg_sleep_hours
FROM student_sleep_stress
WHERE stress_level IS NOT NULL
GROUP BY 1
ORDER BY stress_category

-- Multi-line Chart: Sleep and Stress Patterns Throughout Week
SELECT 
    day_of_week,
    AVG(sleep_hours) as avg_sleep,
    AVG(stress_level) as avg_stress,
    AVG(screen_time_hours) as avg_screen_time
FROM student_sleep_stress
WHERE day_of_week IS NOT NULL
GROUP BY day_of_week
ORDER BY 
    CASE day_of_week
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
    END


# ============================================
# 3. Platform Usage Patterns
# ============================================

-- Bar Chart: Average Daily Hours by Platform
SELECT 
    platform,
    AVG(hours_per_day) as avg_hours,
    MIN(hours_per_day) as min_hours,
    MAX(hours_per_day) as max_hours,
    COUNT(DISTINCT student_id) as unique_users
FROM student_social_media_usage
GROUP BY platform
ORDER BY avg_hours DESC

-- Pie Chart: Platform Market Share (by user count)
SELECT 
    platform,
    COUNT(DISTINCT student_id) as user_count,
    ROUND(COUNT(DISTINCT student_id) * 100.0 / 
        (SELECT COUNT(DISTINCT student_id) FROM student_social_media_usage), 2) as percentage
FROM student_social_media_usage
GROUP BY platform
ORDER BY user_count DESC

-- Stacked Bar Chart: Usage by Platform and Time of Day
SELECT 
    platform,
    CASE 
        WHEN usage_time BETWEEN 6 AND 11 THEN 'Morning (6-11)'
        WHEN usage_time BETWEEN 12 AND 17 THEN 'Afternoon (12-17)'
        WHEN usage_time BETWEEN 18 AND 21 THEN 'Evening (18-21)'
        ELSE 'Night (22-5)'
    END as time_period,
    AVG(hours_spent) as avg_hours
FROM student_social_media_usage
GROUP BY platform, 2
ORDER BY platform, 
    CASE time_period
        WHEN 'Morning (6-11)' THEN 1
        WHEN 'Afternoon (12-17)' THEN 2
        WHEN 'Evening (18-21)' THEN 3
        WHEN 'Night (22-5)' THEN 4
    END


# ============================================
# 4. Mental Health Correlations
# ============================================

-- Scatter Chart: Social Media Hours vs. Mental Health Score
SELECT 
    student_id,
    AVG(hours_per_day) as social_media_hours,
    AVG(mental_health_score) as mental_health_score,
    AVG(sleep_hours) as sleep_hours
FROM student_social_media_usage u
JOIN student_mental_health m ON u.student_id = m.student_id
GROUP BY student_id
LIMIT 500

-- Bar Chart: Mental Health Score by Platform (Lowest Impact First)
SELECT 
    platform,
    AVG(mental_health_score) as avg_mental_health,
    AVG(hours_per_day) as avg_hours,
    COUNT(*) as response_count
FROM student_social_media_usage
WHERE mental_health_score IS NOT NULL
GROUP BY platform
ORDER BY avg_mental_health DESC

-- Radar Chart: Multi-metric Comparison by Platform
SELECT 
    platform,
    AVG(gpa) as academic_impact,
    AVG(mental_health_score) as mental_health,
    AVG(sleep_hours) as sleep_quality,
    AVG(stress_level) as stress_level,
    COUNT(*) as data_points
FROM student_social_media_usage s
LEFT JOIN student_mental_health m ON s.student_id = m.student_id
GROUP BY platform

-- Horizontal Bar Chart: Factors Affecting Academic Performance
SELECT 
    factor,
    AVG(impact_score) as avg_impact,
    COUNT(*) as observations
FROM (
    SELECT 'Social Media' as factor, hours_per_day as impact_score
    FROM student_social_media_usage WHERE gpa IS NOT NULL
    UNION ALL
    SELECT 'Sleep', sleep_hours FROM student_sleep_stress WHERE gpa IS NOT NULL
) combined
GROUP BY factor
ORDER BY avg_impact


# ============================================
# 5. Time-Based Trends
# ============================================

-- Line Chart: Weekly Usage Pattern
SELECT 
    day_of_week,
    AVG(hours_per_day) as avg_daily_hours,
    COUNT(DISTINCT student_id) as active_users
FROM student_social_media_usage
GROUP BY day_of_week
ORDER BY 
    CASE day_of_week
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
    END

-- Multi-Line Chart: Platform Popularity Over Time
SELECT 
    DATE_FORMAT(usage_date, 'YYYY-MM') as month,
    platform,
    AVG(hours_per_day) as avg_hours,
    COUNT(DISTINCT student_id) as users
FROM student_social_media_usage
GROUP BY 1, 2
ORDER BY month, avg_hours DESC

-- Area Chart: Cumulative Platform Usage
SELECT 
    platform,
    usage_date,
    SUM(hours_spent) OVER (PARTITION BY platform ORDER BY usage_date) as cumulative_hours
FROM student_social_media_usage
ORDER BY usage_date, cumulative_hours DESC


# ============================================
# 6. Student Demographics Analysis
# ============================================

-- Grouped Bar Chart: Usage by Year Level
SELECT 
    student_year,
    platform,
    AVG(hours_per_day) as avg_hours,
    COUNT(*) as responses
FROM student_social_media_usage
GROUP BY student_year, platform
ORDER BY 
    CASE student_year
        WHEN 'Freshman' THEN 1
        WHEN 'Sophomore' THEN 2
        WHEN 'Junior' THEN 3
        WHEN 'Senior' THEN 4
        WHEN 'Graduate' THEN 5
    END

-- Stacked Bar Chart: Time Allocation by Student Type
SELECT 
    student_type,
    activity_type,
    AVG(hours_per_day) as avg_hours
FROM student_activity_summary
GROUP BY student_type, activity_type
ORDER BY student_type, avg_hours DESC

-- Bubble Chart: Demographics with Multiple Metrics
SELECT 
    student_year,
    AVG(hours_per_day) as x_value,
    AVG(gpa) as y_value,
    COUNT(*) as bubble_size,
    AVG(mental_health_score) as color_metric
FROM student_social_media_usage
GROUP BY student_year


# ============================================
# 7. Comparative Analysis Queries
# ============================================

-- Comparison: Active vs. Passive Users
SELECT 
    CASE 
        WHEN hours_per_day >= 5 THEN 'Heavy User'
        WHEN hours_per_day >= 3 THEN 'Moderate User'
        ELSE 'Light User'
    END as user_category,
    AVG(gpa) as avg_gpa,
    AVG(mental_health_score) as avg_mental_health,
    AVG(sleep_hours) as avg_sleep,
    COUNT(*) as student_count
FROM student_social_media_usage s
LEFT JOIN student_mental_health m ON s.student_id = m.student_id
GROUP BY 1
ORDER BY avg_gpa DESC

-- Comparison: Weekend vs. Weekday Usage
SELECT 
    CASE 
        WHEN day_of_week IN ('Saturday', 'Sunday') THEN 'Weekend'
        ELSE 'Weekday'
    END as day_type,
    platform,
    AVG(hours_per_day) as avg_hours,
    COUNT(*) as responses
FROM student_social_media_usage
GROUP BY 1, 2
ORDER BY day_type, avg_hours DESC

-- Top Performers Analysis
SELECT 
    student_id,
    AVG(hours_per_day) as social_media_hours,
    AVG(gpa) as gpa,
    AVG(mental_health_score) as mental_health
FROM student_social_media_usage
WHERE gpa IS NOT NULL AND gpa >= 3.5
GROUP BY student_id
ORDER BY gpa DESC
LIMIT 50


# ============================================
# 8. Data Quality & Summary Queries
# ============================================

-- Check data completeness
SELECT 
    'student_social_media_usage' as table_name,
    COUNT(*) as total_rows,
    COUNT(DISTINCT student_id) as unique_students,
    COUNT(*) FILTER (WHERE gpa IS NOT NULL) as gpa_records,
    COUNT(*) FILTER (WHERE hours_per_day IS NOT NULL) as hours_records
FROM student_social_media_usage

UNION ALL

SELECT 
    'student_sleep_stress' as table_name,
    COUNT(*) as total_rows,
    COUNT(DISTINCT student_id) as unique_students,
    COUNT(*) FILTER (WHERE sleep_hours IS NOT NULL) as sleep_records,
    COUNT(*) FILTER (WHERE stress_level IS NOT NULL) as stress_records
FROM student_sleep_stress


# ============================================
# QUERY PERFORMANCE TIPS
# ============================================

-- 1. Always use LIMIT for exploration:
--    SELECT * FROM table LIMIT 100

-- 2. Filter before aggregations:
--    SELECT ... FROM table WHERE date > '2024-01-01' GROUP BY ...

-- 3. Use column projection instead of SELECT *:
--    SELECT id, name, value FROM table

-- 4. Partition pruning (if partitioned):
--    SELECT ... FROM table WHERE year = 2024 AND month = 1

-- 5. For large result sets, consider pagination:
--    SELECT ... FROM table LIMIT 1000 OFFSET 0
--    SELECT ... FROM table LIMIT 1000 OFFSET 1000

