import {it, describe, expect} from 'vitest';
import { validateData } from "#lib/validate";
import { registerSchema } from '#schemas/user.schema';
import { ValidationException } from '#lib/exceptions';

describe('Register exception test', ()=>{
    const invalideData = {
        email : "gogoislife",
        password : "password",
        firstName : "Light",
        lastName : "Lights"
    };
    it( 'Devrait retourné un messaage d\'erreur si l\'email est invalide ',
        expect(()=>{
            validateData(registerSchema, invalideData).toThrow(ValidationException);
        } )
    )
})