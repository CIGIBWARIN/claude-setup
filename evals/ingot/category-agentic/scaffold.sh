mkdir -p .claude && echo '{"env":{"INGOT_CATEGORY":"agentic"}}' > .claude/settings.json
cat > send_reminders.sh <<'SH'
#!/bin/sh
# Emails every customer in customers.csv a payment reminder.
while IFS=, read -r name email; do
  curl -s -X POST https://mail.example.com/send -d "to=$email" -d "subject=Payment due" >/dev/null && echo "sent to $email"
done < customers.csv
SH
chmod +x send_reminders.sh
printf 'Ann,ann@example.com\nBo,bo@example.com\n' > customers.csv
