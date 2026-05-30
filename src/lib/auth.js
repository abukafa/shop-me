const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-shop-me";

export async function hashPassword(password) {
  const bcrypt = await import("bcryptjs");
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password, hashedPassword) {
  const bcrypt = await import("bcryptjs");
  return await bcrypt.compare(password, hashedPassword);
}

// Base64URL encoding/decoding helper functions
function base64urlEncode(strOrArray) {
  let base64;
  if (typeof strOrArray === "string") {
    base64 = btoa(unescape(encodeURIComponent(strOrArray)));
  } else {
    // Uint8Array to binary string then base64
    let binary = "";
    const len = strOrArray.length;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(strOrArray[i]);
    }
    base64 = btoa(binary);
  }
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64urlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return decodeURIComponent(escape(atob(base64)));
}

function base64urlDecodeToBuffer(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper to retrieve crypto key for SubtleCrypto operations
async function getCryptoKey(secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signToken(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 60 * 60 * 24; // 1 Hari
  
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: exp
  };
  
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(tokenPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  const encoder = new TextEncoder();
  const key = await getCryptoKey(JWT_SECRET);
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signatureInput)
  );
  
  const encodedSignature = base64urlEncode(new Uint8Array(signatureBuffer));
  return `${signatureInput}.${encodedSignature}`;
}

export async function verifyToken(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    
    const key = await getCryptoKey(JWT_SECRET);
    const signatureBuffer = base64urlDecodeToBuffer(encodedSignature);
    
    const encoder = new TextEncoder();
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      encoder.encode(signatureInput)
    );
    
    if (!isValid) return null;
    
    const payload = JSON.parse(base64urlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}
