# Save as demo.sh and run: bash demo.sh
TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"123456"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 3 overspeed → ESCALATION
for i in {1..3}; do
  curl -s -X POST http://localhost:5001/api/alerts -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"sourceType":"overspeed","metadata":{"driverId":"D001"}}'
done

# Compliance auto-close
curl -s -X POST http://localhost:5001/api/alerts -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"sourceType":"compliance_document","metadata":{"driverId":"D002","document_renewed":true}}'

# Force job
node -e "import('./src/services/backgroundWorker.js').then(m => m.runAutoCloseJob())"