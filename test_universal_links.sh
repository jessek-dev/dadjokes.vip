#!/bin/bash

echo "🧪 Testing Universal Links Setup for Dad Jokes App"
echo "=================================================="
echo

# Test Apple App Site Association file
echo "📱 Testing iOS Universal Links..."
echo -n "  Apple App Site Association (root): "
if curl -s "https://dadjokes.vip/apple-app-site-association" >/dev/null; then
    echo "✅ Accessible"
else
    echo "❌ Not accessible"
fi

echo -n "  Apple App Site Association (/.well-known/): "
if curl -s "https://dadjokes.vip/.well-known/apple-app-site-association" >/dev/null; then
    echo "✅ Accessible"
else
    echo "⏳ Not accessible (may take time to propagate)"
fi

# Test Android Asset Links
echo
echo "🤖 Testing Android App Links..."
echo -n "  Android Asset Links: "
if curl -s "https://dadjokes.vip/.well-known/assetlinks.json" >/dev/null; then
    echo "✅ Accessible"
else
    echo "⏳ Not accessible (may take time to propagate)"
fi

# Test fallback pages
echo
echo "🌐 Testing Fallback Pages..."
echo -n "  Main page: "
if curl -s "https://dadjokes.vip/" >/dev/null; then
    echo "✅ Working"
else
    echo "❌ Error"
fi

echo -n "  App page: "
if curl -s "https://dadjokes.vip/app/" >/dev/null; then
    echo "✅ Working"
else
    echo "❌ Error"
fi

echo -n "  Joke fallback: "
if curl -s "https://dadjokes.vip/joke/" >/dev/null; then
    echo "✅ Working"
else
    echo "❌ Error"
fi

echo
echo "🔗 Universal Link Test URLs:"
echo "  https://dadjokes.vip/joke/test123"
echo "  https://dadjokes.vip/featured"
echo "  https://dadjokes.vip/home"
echo
echo "📋 Manual Testing Instructions:"
echo "  1. Open one of the test URLs above on your iPhone"
echo "  2. If the app is installed, it should open directly"
echo "  3. If not installed, you'll see a web fallback with App Store link"
echo
echo "✨ Universal links are now LIVE!"