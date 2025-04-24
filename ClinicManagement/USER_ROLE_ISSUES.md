# User Role Issues and Fixes

This document outlines issues related to user roles in the Clinic Management System and provides prompts for fixing them one by one.

## Current Issues

1. **Incorrect "Added by" Attribution**: Patients added by secretary or visitor are incorrectly showing as "Added by doctor".
2. **Visitor Booking Reason Not Displayed**: When a visitor books an appointment, the reason is showing as "not specified".
3. **Secretary Patient Management Interface**: The secretary patient management tab doesn't display the patient search like the doctor interface does.

## Fix Prompts

### 1. Fix Incorrect "Added by" Attribution

```
Fix the issue where patients added by secretary or visitor are incorrectly showing as "Added by doctor".

Steps to investigate:
1. Check how the createdBy field is set when adding patients through different interfaces
2. Verify the AddPatientForm component to ensure it correctly sets the createdBy field
3. Check if there's any code that might be overriding the createdBy value
4. Ensure the patient creation API endpoint correctly preserves the createdBy field
5. Update the UI to correctly display the createdBy information
```

### 2. Fix Visitor Booking Reason Display

```
Fix the issue where visitor booking reasons are not being displayed properly.

Steps to investigate:
1. Check the visitor appointment booking form to ensure it captures the reason field
2. Verify how the reason field is being processed when submitted
3. Check if there's any validation or transformation that might be affecting the reason field
4. Ensure the appointment creation API endpoint correctly handles the reason field
5. Update the UI to properly display the reason field for visitor bookings
```

### 3. Fix Secretary Patient Management Interface

```
Fix the secretary patient management interface to display the patient search like the doctor interface.

Steps to investigate:
1. Compare the SimplifiedSecretaryDashboard and SimplifiedDoctorDashboard components
2. Check how the patient search functionality is implemented in the doctor interface
3. Identify why the secretary interface is stuck on one patient's information
4. Implement the patient search functionality in the secretary interface
5. Ensure the secretary can navigate between patients like the doctor can
```

## Implementation Strategy

For each issue:
1. First investigate the root cause by examining the relevant components and data flow
2. Make minimal, targeted changes to fix the specific issue
3. Test the fix thoroughly to ensure it works as expected
4. Verify that the fix doesn't introduce new issues
5. Document the changes made

## Testing

After implementing each fix:
1. Test the specific functionality that was fixed
2. Perform regression testing to ensure other features still work
3. Test with different user roles (doctor, secretary, visitor) to ensure proper functionality
4. Test with different data scenarios to ensure the fix works in all cases
