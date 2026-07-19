#!/usr/bin/env bash
# =============================================================================
#  push_to_ec2.sh — Copies deploy_ec2.sh to your EC2 instance and runs it
#  Usage:  bash deploy/push_to_ec2.sh  [path-to-your-key.pem]
# =============================================================================
KEY="${1:-~/ai-interview-key.pem}"
EC2_IP="18.61.78.226"
EC2_USER="ubuntu"
REMOTE_SCRIPT="/home/ubuntu/deploy_ec2.sh"

echo "[1/3] Copying deployment script to EC2..."
scp -i "$KEY" -o StrictHostKeyChecking=no \
  "$(dirname "$0")/deploy_ec2.sh" \
  "${EC2_USER}@${EC2_IP}:${REMOTE_SCRIPT}"

echo "[2/3] Making it executable..."
ssh -i "$KEY" -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_IP}" \
  "chmod +x ${REMOTE_SCRIPT}"

echo "[3/3] Running deployment on EC2 (you will be prompted for secrets)..."
ssh -i "$KEY" -tt -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_IP}" \
  "sudo bash ${REMOTE_SCRIPT}"
