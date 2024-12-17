import  supabase  from '../init';


export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return { success: true, message: 'Logout berhasil' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
