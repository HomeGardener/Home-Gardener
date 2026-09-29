
export class validaciones {
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return typeof email === 'string' && re.test(email.trim());
    }

    isValidString(string) {
       return typeof string === 'string' && string.trim().length >= 3;
    }

    isPositivo(value) {
        return typeof value === 'number' && Number.isFinite(value) && value > 0;
    }

    isEnteroPositivo(value) {
        return Number.isSafeInteger(value) && value > 0;
    }

    isValidHumidity(value) {
        return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;
    }

    isValidTemperature(value) {
        return typeof value === 'number' && Number.isFinite(value) && value >= -40 && value <= 85;
    }

    isValidDate(dateString) { 
        return typeof dateString === 'string' && dateString.trim() !== '' && Number.isFinite(Date.parse(dateString));
    }
    
    isValidPassword(password) {
        if (!password || typeof password !== 'string') {
            return false;
        }
        return password.length >= 8 && Buffer.byteLength(password, 'utf8') <= 72 && /[a-zA-Z]/.test(password) && /\d/.test(password);
    }
}
