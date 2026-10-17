/*
 * PowerGuard embedded-C demonstration.
 * The sample array stands in for values returned by sensor/ADC drivers.
 * This is not target-hardware firmware, calibrated instrumentation, or safety equipment.
 */
#include <stdio.h>
#include <stddef.h>

#define VOLTAGE_MIN_V 207.0f
#define VOLTAGE_MAX_V 253.0f
#define CURRENT_MAX_A 1.50f
#define TEMPERATURE_MAX_C 60.0f

typedef struct {
    const char *reading_id;
    float voltage_v;
    float current_a;
    float temperature_c;
} SensorReading;

static const SensorReading sample_readings[] = {
    {"PG001", 230.1f, 0.42f, 36.5f},
    {"PG003", 201.5f, 0.50f, 42.0f},
    {"PG004", 231.0f, 1.92f, 45.0f},
    {"PG005", 232.0f, 0.60f, 64.8f},
    {"PG006", 254.2f, 0.40f, 35.0f},
    {"PG010", 228.6f, 0.36f, 33.1f}
};

static void report_reading(const SensorReading *reading)
{
    int alert_count = 0;
    const float apparent_power_va = reading->voltage_v * reading->current_a;

    printf("%s | %.1f V | %.2f A | %.1f C | %.1f VA | ",
           reading->reading_id, reading->voltage_v, reading->current_a,
           reading->temperature_c, apparent_power_va);
    if (reading->voltage_v < VOLTAGE_MIN_V) {
        printf("UNDER_VOLTAGE ");
        ++alert_count;
    }
    if (reading->voltage_v > VOLTAGE_MAX_V) {
        printf("OVER_VOLTAGE ");
        ++alert_count;
    }
    if (reading->current_a > CURRENT_MAX_A) {
        printf("HIGH_CURRENT ");
        ++alert_count;
    }
    if (reading->temperature_c >= TEMPERATURE_MAX_C) {
        printf("HIGH_TEMPERATURE ");
        ++alert_count;
    }
    if (alert_count == 0) {
        printf("NORMAL");
    } else {
        printf("ALERT (%d flag%s)", alert_count, alert_count == 1 ? "" : "s");
    }
    putchar('\n');
}

int main(void)
{
    const size_t count = sizeof(sample_readings) / sizeof(sample_readings[0]);
    puts("PowerGuard embedded-C demo (synthetic readings)");
    puts("ID     | Voltage | Current | Temp  | Apparent | Status");
    for (size_t index = 0; index < count; ++index) {
        report_reading(&sample_readings[index]);
    }
    return 0;
}
