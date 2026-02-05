# SSL

## Generate an Ed25519 key-pair

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

## Generate a 2048-bit RSA private key and Certificate Signing Request (CSR)

```bash
openssl req -newkey rsa:2048 -keyout PRIVATEKEY.key -out MYCSR.csr
```

## Save an encrypted private key unencrypted

```bash
openssl rsa -in <encrypted_private.key>  -out <decrypted_private.key>
```

## Convert x509 certificate to PEM

```bash
openssl x509 -in cert.crt -out cert.pem 
```
