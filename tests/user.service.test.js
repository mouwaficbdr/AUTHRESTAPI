import { it, describe, expect, vi, beforeEach } from 'vitest';
import { UserService } from '#services/user.service';
import {ConflictException} from '#lib/exceptions'
import prisma from '#lib/prisma'; // On importe le vrai, mais on va le simuler

// On dit à Vitest de remplacer le fichier prisma.js par une version factice
vi.mock('#lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('UserService - Register', () => {
  
  // Cette fonction s'exécute avant chaque test pour remettre les compteurs à zéro
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait créer un utilisateur et hacher son mot de passe', async () => {
        // 1. Arrange (Préparation)
        const userData = {
          email: 'prof@test.com',
          password: 'monSuperPassword123',
          firstName: 'Prof AI',
          lastName: 'Prof ML'
        };

        // On simule que l'utilisateur n'existe pas encore (findUnique renvoie null)
        prisma.user.findUnique.mockResolvedValue(null);
        
        // On simule que la création réussit et renvoie l'utilisateur avec un ID
        prisma.user.create.mockResolvedValue({
        id: "1SDCDSQSS",
        ...userData,
        password: 'HACHED_PASSWORD' // On simule un mot de passe haché
        });

        // 2. Act (Action)
        const result = await UserService.register(userData);

        // 1. On vérifie que la méthode create a bien été appelée
        expect(prisma.user.create).toHaveBeenCalled();

        // 2. On récupère ce que le service a envoyé à prisma.user.create({ data: ... })
        const args = prisma.user.create.mock.calls[0][0];

        // 3. On vérifie le contenu de l'envoi
        expect(args.data.password).not.toBe("monSuperPassword123");

        // 4. On vérifie le résultat final renvoyé par ton service
        expect(result.id).toBe("1SDCDSQSS");
    });

it('devrait lancer une ConflictException si l\'email existe déjà', async () => {
    // 1. Arrange
    const data = {
        email: "deja@pris.com",
        password: "password123",
        firstName: "Test User",
        lastName: "Test lastName"
    };

    // On simule que l'utilisateur EXISTE déjà
    prisma.user.findUnique.mockResolvedValue({
        id: "ddfdfdfqsds99", 
        email: "deja@pris.com"
    });

    // 2. Act & 3. Assert (On combine les deux pour les erreurs)
    // On ne met pas "await" devant l'appel direct, mais devant le "expect"
    await expect(UserService.register(data)).rejects.toThrow(ConflictException);

});});