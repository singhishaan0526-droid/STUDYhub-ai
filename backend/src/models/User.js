const { getSupabase } = require('../config/db');

class User {
  static normalize(user) {
    if (!user) return null;
    return {
      ...user,
      _id: user.id // mapping _id to id for backwards compatibility with existing frontend/jwt logic
    };
  }

  static async findOne(query) {
    const supabase = getSupabase();
    let builder = supabase.from('users').select('*');
    for (const key in query) {
      builder = builder.eq(key, query[key]);
    }
    const { data, error } = await builder.maybeSingle();
    if (error) throw new Error(error.message);
    return this.normalize(data);
  }

  static async findById(id) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return this.normalize(data);
  }

  static async create(userData) {
    const supabase = getSupabase();
    const { name, email, password_hash, class_level } = userData;
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password_hash, class_level }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.normalize(data);
  }
}

module.exports = User;
