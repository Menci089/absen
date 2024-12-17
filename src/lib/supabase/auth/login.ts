import supabase from "../init";

export const loginUser = async (email: string, password: string) => {
  try {
    // Autentikasi user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw new Error(`Login gagal: ${authError.message}`);

    if (!authData?.user?.id) {
      throw new Error('Gagal mendapatkan ID user setelah login');
    }

    // Ambil data user dari tabel `users`
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      throw new Error(`Gagal mengambil data user: ${userError.message}`);
    }

    if (!userData) {
      throw new Error('User tidak ditemukan di tabel users');
    }

    return { success: true, user: userData };
  } catch (error: any) {
    console.error('Error di loginUser:', error);
    return { success: false, message: error.message };
  }
};
