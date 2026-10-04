-- Activa MVP application RPCs and profile provisioning.
-- Run this after 202610030001_initial.sql.

create or replace function public.ensure_my_profile()
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Authentication required'; end if;
  insert into public.profiles(id, display_name)
  values(uid, coalesce(auth.jwt()->'user_metadata'->>'display_name', split_part(coalesce(auth.jwt()->>'email','Member'),'@',1)))
  on conflict(id) do nothing;
  return uid;
end
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  insert into public.profiles(id, display_name)
  values(new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email,'Member'),'@',1)))
  on conflict(id) do nothing;
  return new;
end
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.create_community(p_name text, p_description text default null, p_category text default 'Community')
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare uid uuid; cid uuid; slug_base text; final_slug text;
begin
  uid := public.ensure_my_profile();
  if length(trim(p_name)) < 2 then raise exception 'Community name is required'; end if;
  slug_base := lower(regexp_replace(trim(p_name), '[^a-zA-Z0-9]+', '-', 'g'));
  slug_base := trim(both '-' from slug_base);
  final_slug := coalesce(nullif(slug_base,''),'community') || '-' || substr(replace(gen_random_uuid()::text,'-',''),1,6);
  insert into public.communities(name, slug, description, category)
  values(trim(p_name), final_slug, nullif(trim(coalesce(p_description,'')),''), coalesce(nullif(trim(p_category),''),'Community'))
  returning id into cid;
  insert into public.community_memberships(user_id, community_id, role) values(uid, cid, 'owner');
  insert into public.audit_logs(community_id, actor_id, action, target_id, details)
  values(cid, uid, 'community.created', cid, jsonb_build_object('name',trim(p_name)));
  return cid;
end
$$;

create or replace function public.create_quiz_activity(
  p_community_id uuid,
  p_title text,
  p_description text,
  p_duration_seconds int,
  p_questions jsonb
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare uid uuid; aid uuid; q jsonb; qid uuid; oid uuid; idx int; option_text text; correct_idx int; qpos int := 0; total_points int := 0;
begin
  uid := public.ensure_my_profile();
  if not public.is_admin(p_community_id) then raise exception 'Admin access required'; end if;
  if length(trim(p_title)) < 2 then raise exception 'Activity title is required'; end if;
  if jsonb_array_length(coalesce(p_questions,'[]'::jsonb)) = 0 then raise exception 'Add at least one question'; end if;

  total_points := jsonb_array_length(p_questions) * 10;
  insert into public.activities(community_id, creator_id, type, title, description, points, duration_seconds, status, config)
  values(p_community_id, uid, 'quiz', trim(p_title), nullif(trim(coalesce(p_description,'')),''), total_points, greatest(coalesce(p_duration_seconds,300),30), 'draft',
         jsonb_build_object('attempts_allowed',1,'randomise_questions',true,'randomise_answers',true,'show_answers',true))
  returning id into aid;

  for q in select * from jsonb_array_elements(p_questions)
  loop
    qpos := qpos + 1;
    correct_idx := coalesce((q->>'correctIndex')::int,0);
    insert into public.activity_questions(activity_id, community_id, question, explanation, points, position)
    values(aid, p_community_id, trim(q->>'question'), nullif(trim(coalesce(q->>'explanation','')),''), 10, qpos)
    returning id into qid;

    idx := 0;
    for option_text in select jsonb_array_elements_text(q->'options')
    loop
      insert into public.activity_options(question_id, activity_id, label, position)
      values(qid, aid, option_text, idx + 1)
      returning id into oid;
      if idx = correct_idx then
        insert into public.activity_question_keys(question_id, correct_option_id, community_id)
        values(qid, oid, p_community_id);
      end if;
      idx := idx + 1;
    end loop;
    if idx < 2 then raise exception 'Each question needs at least two options'; end if;
  end loop;

  insert into public.audit_logs(community_id, actor_id, action, target_id, details)
  values(p_community_id, uid, 'activity.created', aid, jsonb_build_object('title',trim(p_title),'type','quiz'));
  return aid;
end
$$;

create or replace function public.set_activity_status(p_activity_id uuid, p_status public.activity_status)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare a public.activities;
begin
  select * into a from public.activities where id=p_activity_id;
  if not found then raise exception 'Activity not found'; end if;
  if not public.is_admin(a.community_id) then raise exception 'Admin access required'; end if;
  update public.activities set status=p_status where id=p_activity_id;
  insert into public.audit_logs(community_id, actor_id, action, target_id, details)
  values(a.community_id, auth.uid(), 'activity.status_changed', p_activity_id, jsonb_build_object('status',p_status));
end
$$;

revoke all on function public.ensure_my_profile() from public;
revoke all on function public.create_community(text,text,text) from public;
revoke all on function public.create_quiz_activity(uuid,text,text,int,jsonb) from public;
revoke all on function public.set_activity_status(uuid,public.activity_status) from public;
grant execute on function public.ensure_my_profile(), public.create_community(text,text,text), public.create_quiz_activity(uuid,text,text,int,jsonb), public.set_activity_status(uuid,public.activity_status) to authenticated;
