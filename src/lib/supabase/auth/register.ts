import supabase from '../init';

export const registerUser = async (email:string, password:string, name:string, role = 'member') => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (!authData.user?.id || !email || !name) {
      throw new Error('Data user atau email tidak valid.');
    }

    const { error: userError } = await supabase
      .from('users')
      .insert([{ 
        id: authData.user.id, 
        email,
        name, 
        role
      }]);

    if (userError) throw userError;

    return { success: true, message: 'Registrasi berhasil' };
  } catch (error: any) {
    console.error('Register Error:', error);
    return { success: false, message: error.message || 'Gagal registrasi' };
  }
};

