import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export const generateJwt = (id, email, res) => {
    const token = jwt.sign({ id, email }, ENV.JWT_SECRET, {
        expiresIn: '30d'
    });

    const isProduction = ENV.NODE_ENV === 'production';

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return token;
};