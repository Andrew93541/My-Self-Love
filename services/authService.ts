
import { User, UserRole } from '../types';

const USERS_KEY = 'mysafelove_users';

const getUsers = (): User[] => {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
};

const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const hashPassword = (password: string) => {
    return btoa(password); 
};

export const authService = {
    login: async (email: string, password: string): Promise<User> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const users = getUsers();
        const user = users.find(u => u.email === email && u.passwordHash === hashPassword(password));
        
        if (!user) throw new Error('Invalid email or password');
        return user;
    },

    signup: async (name: string, email: string, password: string, role: UserRole): Promise<User> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const users = getUsers();
        if (users.find(u => u.email === email)) {
            throw new Error('Email already exists');
        }

        const newUser: User = {
            id: Date.now().toString(),
            name,
            email,
            passwordHash: hashPassword(password),
            joinedDate: Date.now(),
            role
        };

        users.push(newUser);
        saveUsers(users);
        return newUser;
    }
};
