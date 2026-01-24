#!/usr/bin/env node

/**
 * Script de vérification de la configuration Mailtrap
 * Exécutez: node verify-email-setup.js
 */

import dotenv from 'dotenv';
import { logger } from '#lib/logger';

// Charger les variables d'environnement
dotenv.config();

console.log('\n🔍 Vérification de la configuration Mailtrap...\n');

const requiredEnvVars = [
  'MAILTRAP_USER',
  'MAILTRAP_PASS',
  'MAILTRAP_HOST',
  'MAILTRAP_PORT',
];

const optionalEnvVars = [
  'MAILTRAP_FROM',
  'FRONTEND_URL',
];

let allOk = true;

// Vérifier les variables requises
console.log('📋 Variables requises:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const maskedValue = varName === 'MAILTRAP_PASS' 
      ? '***' + value.slice(-3) 
      : value;
    console.log(`  ✅ ${varName} = ${maskedValue}`);
  } else {
    console.log(`  ❌ ${varName} = (non configurée)`);
    allOk = false;
  }
});

// Vérifier les variables optionnelles
console.log('\n📋 Variables optionnelles:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName} = ${value}`);
  } else {
    console.log(`  ℹ️  ${varName} = (utilise la valeur par défaut)`);
  }
});

// Vérification finale
console.log('\n' + '='.repeat(50));
if (allOk) {
  console.log('✅ Configuration Mailtrap OK!');
  console.log('\nPour tester, exécutez: npm run test:email');
} else {
  console.log('❌ Configuration Mailtrap incomplète!');
  console.log('\nLisez MAILTRAP_SETUP.md pour les instructions.');
}
console.log('='.repeat(50) + '\n');

process.exit(allOk ? 0 : 1);
