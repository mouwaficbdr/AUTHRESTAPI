import { it, describe, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.js'; 

describe('User Controller - POST /register', () => {

  it('devrait retourner 201 pour une inscription valide', async () => {
    const uniqueEmail = `user-${Date.now()}@test.com`;
    const response = await request(app)
      .post('/register')
      .send({
        email: uniqueEmail,
        password: 'password123',
        name: 'Test User'
      });

    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe(uniqueEmail);
  });

  it('devrait retourner 400 pour un email invalide', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'pas-un-email',
        password: 'password123'
      });

    expect(response.status).toBe(400);
  });
});