#!/bin/bash
# Update Vercel environment variables

# Update for production
vercel env add MONGODB_URI production << EOF
mongodb+srv://Vercel-Admin-Uphouse:XCrxLW0s8aTJvt1j@uphouse.pmytedv.mongodb.net/uphouse?retryWrites=true&w=majority
EOF

# Update for preview
vercel env add MONGODB_URI preview << EOF
mongodb+srv://Vercel-Admin-Uphouse:XCrxLW0s8aTJvt1j@uphouse.pmytedv.mongodb.net/uphouse?retryWrites=true&w=majority
EOF

# Update for development
vercel env add MONGODB_URI development << EOF
mongodb+srv://Vercel-Admin-Uphouse:XCrxLW0s8aTJvt1j@uphouse.pmytedv.mongodb.net/uphouse?retryWrites=true&w=majority
EOF

echo "✅ Environment variables updated!"
echo "Now run: vercel --prod"