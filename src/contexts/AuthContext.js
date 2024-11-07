import React, { createContext, useState, useContext, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const AuthContext = createContext(null);

// Inicialização do cliente Supabase
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const userData = {
          userId: session.user.id,
          email: session.user.email,
          role: session.user.user_metadata.role || 'user',
          company: session.user.user_metadata.company || {
            name: session.user.user_metadata.name || '',
            cnpj: '',
            phone: '',
            address: {}
          }
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const userData = {
        userId: user.id,
        email: user.email,
        role: user.user_metadata.role,
        company: user.user_metadata.company,
        businessType: user.user_metadata.businessType
      };

      setUser(userData);
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const register = async (email, password, userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'user',
            company: {
              name: userData.companyName,
              cnpj: '',
              phone: '',
              address: {
                street: '',
                number: '',
                complement: '',
                district: '',
                city: userData.city,
                state: '',
                zipCode: ''
              }
            },
            business_type: userData.businessType,
            has_certificate: false,
            nfe_config: {
              ambiente: 'homologacao',
              serie: '1',
              numero_inicial: 1
            },
            service_types: userData.serviceTypes
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro no login com Google:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      loginWithGoogle 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
