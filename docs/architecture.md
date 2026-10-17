# Architecture and ECE Design Notes

## System flow

```text
Sensor or CSV source
        |
Validate and normalize values
        |
Calculate voltage × current (VA)
        |
Apply prototype thresholds
        |
NORMAL or ALERT flags
        |
Terminal report / future telemetry
```

This version is simulation-first. Python reads CSV records; the embedded-C example uses a constant array representing readings returned by sensor drivers.

## Possible physical signal path

1. A sensor/transducer produces an electrical signal.
2. Analog conditioning scales the signal for the ADC input range.
3. The ADC converts the signal to digital counts.
4. Firmware applies calibration and scaling.
5. A digital filter can reduce noise, with some response delay.
6. Threshold logic sets status flags.
7. UART or another interface sends timestamped data to a logger/dashboard.

The current repository starts after sensor acquisition and calibration. Physical acquisition is future work.

## Units and rules

- Voltage: volts (V); current: amperes (A); temperature: degrees Celsius (°C).
- Voltage multiplied by current is reported as apparent power in volt-amperes (VA), not watts. This demo does not measure power factor or synchronized voltage/current waveforms.
- Status becomes ALERT when one or more prototype thresholds are crossed.
- Thresholds are examples only; real limits require equipment-specific specifications and safety review.

## Why C and Python?

C models a compact logic loop that could be adapted to a microcontroller. Python simplifies batch data inspection and automated tests. Similar rules in both implementations make it easier to compare expected behavior.

## Employer relevance (independent learning project)

- Texas Instruments: embedded C, ADC/sensor concepts, input validation, threshold logic.
- BEL: telemetry-style monitoring, deterministic fault flags, and testable behavior.
- Reliance Industries: the general idea of equipment-condition and electrical-parameter monitoring.

This project is not affiliated with these companies and is not an industrially certified product.

## Future steps

- Add a sensor interface abstraction and ADC scaling for a specified board.
- Implement and measure a moving-average filter.
- Add UART telemetry with sequence numbers and error detection.
- Compare readings against a reference instrument at safe low voltages.
- Document accuracy, repeatability, and limitations after physical testing.
- For real AC power, acquire appropriately synchronized waveforms and calculate average instantaneous power.
