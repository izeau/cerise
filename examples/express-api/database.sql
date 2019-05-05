create table if not exists todos (
  text text not null check (length(trim(text)) > 0),
  done boolean not null default false,
  updated datetime not null default current_timestamp
);

create trigger if not exists todos_updated
after update of done on todos
begin
  update todos
  set updated = current_timestamp
  where old.done != new.done and rowid = old.rowid;
end;
