
export class validaciones {
    isValidEmail(email) {
        // Expresión regular simple para validar emails
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || typeof email !== 'string' || !re.test(email)) {
           return false;
        }
        return true;
    }

    isValidString(string) {
       if (!string || typeof string !== 'string' || string.trim() === '' || string.length < 3) {
            return false;
        }
        return true;
    }

    isPositivo(value) {
        if (value === undefined || value <= 0 || isNaN(value)) {
           return false;
        }
        return true;
    }

    isValidDate(dateString) { 
        const date = new Date(dateString);
        let ret = true;
        if (isNaN(date.getTime())) {
            ret =  false; 
        }
        return ret;
    }
    
    isValidPassword(password) {
        if (!password || typeof password !== 'string') {
            return false;
        }
        return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
    }
}