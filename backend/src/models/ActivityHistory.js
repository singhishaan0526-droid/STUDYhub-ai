const { getSupabase } = require('../config/db');

class ActivityHistory {
  static normalize(item) {
    if (!item) return null;
    return {
      ...item,
      _id: item.id // mapping _id to id for backwards compatibility
    };
  }

  static normalizeArray(items) {
    if (!Array.isArray(items)) return [];
    return items.map(item => this.normalize(item));
  }

  static async create(data) {
    const supabase = getSupabase();
    const { user_id, activity_type, input_data, generated_content } = data;
    const { data: result, error } = await supabase
      .from('activity_history')
      .insert([{ user_id, activity_type, input_data, generated_content }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.normalize(result);
  }

  static async find(query = {}) {
    const supabase = getSupabase();
    let builder = supabase.from('activity_history').select('*').order('created_at', { ascending: false });

    for (const key in query) {
      if (key === '_id' || key === 'id') {
        builder = builder.eq('id', query[key]);
      } else {
        builder = builder.eq(key, query[key]);
      }
    }

    const { data, error } = await builder;
    if (error) throw new Error(error.message);

    // Provide chainable .sort() for backward compatibility if called as ActivityHistory.find().sort()
    const results = this.normalizeArray(data);
    results.sort = function() { return results; };
    return results;
  }

  static async findOne(query = {}) {
    const supabase = getSupabase();
    let builder = supabase.from('activity_history').select('*').order('created_at', { ascending: false });

    for (const key in query) {
      if (key === '_id' || key === 'id') {
        builder = builder.eq('id', query[key]);
      } else {
        builder = builder.eq(key, query[key]);
      }
    }

    const { data, error } = await builder.limit(1).maybeSingle();
    if (error) throw new Error(error.message);

    const result = this.normalize(data);
    if (result) {
      result.sort = function() { return result; };
    }
    return result;
  }

  static async findOneAndDelete(query = {}) {
    const supabase = getSupabase();
    let builder = supabase.from('activity_history').delete();

    for (const key in query) {
      if (key === '_id' || key === 'id') {
        builder = builder.eq('id', query[key]);
      } else {
        builder = builder.eq(key, query[key]);
      }
    }

    const { data, error } = await builder.select();
    if (error) throw new Error(error.message);
    return data && data.length > 0 ? this.normalize(data[0]) : null;
  }

  static async findOneAndUpdate(query = {}, updateData = {}) {
    const supabase = getSupabase();
    let builder = supabase.from('activity_history').update(updateData);

    for (const key in query) {
      if (key === '_id' || key === 'id') {
        builder = builder.eq('id', query[key]);
      } else {
        builder = builder.eq(key, query[key]);
      }
    }

    const { data, error } = await builder.select();
    if (error) throw new Error(error.message);
    return data && data.length > 0 ? this.normalize(data[0]) : null;
  }
}

module.exports = ActivityHistory;
