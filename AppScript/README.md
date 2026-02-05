# Google Apps Script

## `DeleteOldMessages`—Gmail Auto-Cleanup Script

Automatically delete old emails from Gmail based on customizable rules using Google Apps Script.

### Features

- Rule-based filtering: Define multiple cleanup rules based on sender, age, and labels
- Debug mode: Test rules safely before actually deleting emails
- Smart label handling: Optionally preserve manually labeled emails
- Automatic reporting: Receive email summaries after each execution
- Flexible scheduling: Run manually or set up automatic triggers, you choose when creating your trigger

### Installation

1. Open Google Apps Script

    - Visit script.google.com
    - Click New project

1. Copy the script

    - Copy the contents of DeleteOldMessages.js
    - Paste it into the Apps Script editor

1. Save the project

    - Give your project a meaningful name (e.g., "Gmail Cleanup")
    - Click the save icon or press Ctrl+S / Cmd+S

1. Authorize the script

    - Run the script once manually to authorize permissions
    - Review and accept the required permissions

### Configuration

Run the script with `DEBUG` set to true to check the script's behavior. Nothing is deleted when set to true, and no email report is sent.

Edit the rules array in the script to define your cleanup criteria:

```javascript
const rules = [
  {
    name: "LinkedIn Job Alerts",
    label: 'inbox',
    ignoreLabeled: false,
    sender: "jobalerts-noreply@linkedin.com",
    age: "15d"
  },
  // Add more rules here...
];
```

Note: `sender` can be an array of email.

### Usage

1. Manual Execution

    - Open your Apps Script project
    - Select the main function from the dropdown
    - Click the Run button
    - Check the for the execution report

1. Automatic Execution, once you validated the script behavior

    1. In Apps Script, click Triggers (clock icon in the left sidebar)
    1. Click Add Trigger
    1. Configure the trigger:

        - Choose function: `main`
        - Event source: Time-driven
        - Type: Day timer or Week timer
        - Time: Choose your preferred time (e.g., 2am daily)

    1. Click Save

### Rule Parameters

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `name` | `String` | Yes | Descriptive name for the rule (used in logs) |
| `label` | `String` | No | Gmail label to search (e.g., `"inbox"`, `"promotions"`) |
| `ignoreLabeled` | `Boolean` | No | If `true`, skips threads that have any labels applied |
| `sender` | `String\|[String]` | No | Email address of the sender to filter |
| `age` | `String` | No | Minimum age of threads (e.g., `"15d"`, `"2m"`, `"1y"`) |
| `title` | `String` | No | Subject line to match (supports partial matches) |

### Age Format

- `d` = days (e.g., `"15d"` = 15 days)
- `m` = months (e.g., `"2m"` = 2 months)
- `y` = years (e.g., `"1y"` = 1 year)

### ⚠️ Important Considerations ⚠️

- Deleted threads go to **Trash** (recoverable for 30 days)
- Use **debug mode** extensively before enabling auto-deletion
- Gmail's trash is automatically emptied after 30 days
- Create **backups** of important emails before running
- Test with **non-critical** email accounts first

### Best Practices

#### 1. Always Test First

- Set `DEBUG` to `true` to preview what will be deleted
- Look at the generated search query, you can try it Gmail's search box
- Review the execution report before switching to production mode
- Start with a small subset of emails to verify behavior

#### 2. Use Conservative Age Limits

- Begin with longer retention periods (e.g., `"60d"`)
- Gradually decrease as you become comfortable with the script
- Consider the importance of different email types

#### 3. Protect Important Emails

- Use `ignoreLabeled: true` to ignore email that you've labeled
- Manually label emails you want to keep permanently
- Consider using labels to keep important email, or create Gmail rules to automatically labels emails matching some criterion
- Create separate rules for different types of content

#### 4. Monitor Execution Reports

- Check email reports regularly, especially when first setting up
- Verify the number of deleted threads matches expectations
- Look for patterns in what's being deleted

#### 5. Schedule Wisely

- Run during off-hours to avoid disrupting your workflow
- Daily execution works well for high-volume senders
- Weekly execution is sufficient for most use cases

#### 6. Combine Multiple Filters

- Use multiple parameters in a single rule for precise targeting
- Example: sender + age + label for maximum specificity

### License

This project is provided as-is for personal use. Modify and distribute freely.

### **Disclaimer**

This script permanently deletes emails after 30 days (Gmail trash retention). Always test thoroughly and ensure you have backups of important emails before automating deletion.
