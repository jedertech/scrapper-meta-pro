import { DatabaseSync } from 'node:sqlite';
import { chmodSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Ad, Method, Mode, Status } from './types.js';
import { safeName } from './security.js';

export interface Job {
  id: string; database_id: number; db_name: string; search_url: string; mode: Mode; method: Method; browser: string;
  target_total: number; status: Status; cursor: string | null; observed: number; unique_ads: number;
  new_advertisers: number; duplicate_ads: number; duplicate_advertisers: number; invalid: number;
  started_at: string; updated_at: string; finished_at: string | null; reason: string | null;
}

export class Storage {
  readonly db: DatabaseSync;
  constructor(path: string) {
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(path);
    chmodSync(path,0o600);
    this.db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
    this.migrate();
  }
  close(): void { this.db.close(); }
  private migrate(): void {
    this.db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS prospecting_databases(id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY, database_id INTEGER NOT NULL REFERENCES prospecting_databases(id),
        search_url TEXT NOT NULL, mode TEXT NOT NULL CHECK(mode IN ('ads','advertisers')), method TEXT NOT NULL CHECK(method='playwright'),
        browser TEXT NOT NULL, target_total INTEGER NOT NULL CHECK(target_total>0), status TEXT NOT NULL, cursor TEXT,
        observed INTEGER NOT NULL DEFAULT 0, unique_ads INTEGER NOT NULL DEFAULT 0, new_advertisers INTEGER NOT NULL DEFAULT 0,
        duplicate_ads INTEGER NOT NULL DEFAULT 0, duplicate_advertisers INTEGER NOT NULL DEFAULT 0, invalid INTEGER NOT NULL DEFAULT 0,
        started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        finished_at TEXT, reason TEXT);
      CREATE TABLE IF NOT EXISTS job_leases(job_id TEXT PRIMARY KEY REFERENCES jobs(id), owner TEXT NOT NULL, expires_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS advertisers(id TEXT PRIMARY KEY, name TEXT NOT NULL, first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS database_advertisers(database_id INTEGER NOT NULL REFERENCES prospecting_databases(id), advertiser_id TEXT NOT NULL REFERENCES advertisers(id),
        first_job_id TEXT NOT NULL REFERENCES jobs(id), PRIMARY KEY(database_id,advertiser_id));
      CREATE TABLE IF NOT EXISTS ads(id TEXT PRIMARY KEY, advertiser_id TEXT NOT NULL REFERENCES advertisers(id), advertiser_name TEXT NOT NULL,
        description TEXT, cta_url TEXT, library_url TEXT NOT NULL, country TEXT, platforms TEXT, ad_start_date TEXT, ad_status TEXT, cta_text TEXT,
        method TEXT NOT NULL, quality TEXT NOT NULL, quality_reason TEXT, first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS database_ads(database_id INTEGER NOT NULL REFERENCES prospecting_databases(id), ad_id TEXT NOT NULL REFERENCES ads(id),
        first_job_id TEXT NOT NULL REFERENCES jobs(id), PRIMARY KEY(database_id,ad_id));
      CREATE TABLE IF NOT EXISTS observations(job_id TEXT NOT NULL REFERENCES jobs(id), ad_id TEXT NOT NULL REFERENCES ads(id),
        observed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(job_id,ad_id));
      CREATE TABLE IF NOT EXISTS record_errors(id INTEGER PRIMARY KEY, job_id TEXT NOT NULL REFERENCES jobs(id), code TEXT NOT NULL,
        reason TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS exports(id INTEGER PRIMARY KEY, job_id TEXT NOT NULL REFERENCES jobs(id), path TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
      CREATE INDEX IF NOT EXISTS idx_jobs_db ON jobs(database_id);
      CREATE INDEX IF NOT EXISTS idx_observations_job ON observations(job_id);
      CREATE INDEX IF NOT EXISTS idx_dbads_job ON database_ads(first_job_id);
      CREATE INDEX IF NOT EXISTS idx_dbadv_job ON database_advertisers(first_job_id);`);
    this.db.prepare('INSERT OR IGNORE INTO schema_migrations(version) VALUES (1)').run();
    if (!this.db.prepare('SELECT 1 FROM schema_migrations WHERE version=2').get()) {
      this.db.exec(`BEGIN IMMEDIATE;
        CREATE TABLE searches(id INTEGER PRIMARY KEY, normalized_url TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE checkpoints(job_id TEXT PRIMARY KEY REFERENCES jobs(id), method TEXT NOT NULL, cursor TEXT,
          observed INTEGER NOT NULL, unique_ads INTEGER NOT NULL, new_advertisers INTEGER NOT NULL,
          duplicate_ads INTEGER NOT NULL, duplicate_advertisers INTEGER NOT NULL, invalid INTEGER NOT NULL,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
        ALTER TABLE jobs ADD COLUMN search_id INTEGER REFERENCES searches(id);
        INSERT OR IGNORE INTO searches(normalized_url) SELECT DISTINCT search_url FROM jobs;
        UPDATE jobs SET search_id=(SELECT id FROM searches WHERE normalized_url=jobs.search_url);
        INSERT INTO checkpoints(job_id,method,cursor,observed,unique_ads,new_advertisers,duplicate_ads,duplicate_advertisers,invalid)
          SELECT id,method,cursor,observed,unique_ads,new_advertisers,duplicate_ads,duplicate_advertisers,invalid FROM jobs;
        INSERT INTO schema_migrations(version) VALUES (2);
        COMMIT;`);
    }
    if (!this.db.prepare('SELECT 1 FROM schema_migrations WHERE version=3').get()) {
      this.db.exec('BEGIN IMMEDIATE');
      try {
        this.db.exec(`ALTER TABLE ads ADD COLUMN meta_page_id TEXT;
          UPDATE ads SET meta_page_id=advertiser_id WHERE advertiser_id GLOB '[0-9]*' AND advertiser_id NOT GLOB '*[^0-9]*';
          INSERT INTO schema_migrations(version) VALUES (3);`);
        this.db.exec('COMMIT');
      } catch (error) { this.db.exec('ROLLBACK'); throw error; }
    }
    if (!this.db.prepare('SELECT 1 FROM schema_migrations WHERE version=4').get()) {
      this.db.exec('BEGIN IMMEDIATE');
      try {
        this.db.exec(`ALTER TABLE ads ADD COLUMN meta_page_id_source TEXT;
          INSERT INTO schema_migrations(version) VALUES (4);`);
        this.db.exec('COMMIT');
      } catch (error) { this.db.exec('ROLLBACK'); throw error; }
    }
  }
  integrity(): string { return String((this.db.prepare('PRAGMA integrity_check').get() as { integrity_check: string }).integrity_check); }
  backup(path: string): void { this.db.exec(`VACUUM INTO '${path.replaceAll("'", "''")}'`); chmodSync(path,0o600); }
  createBase(name: string): void { this.db.prepare('INSERT INTO prospecting_databases(name) VALUES (?)').run(safeName(name)); }
  listBases(): object[] { return this.db.prepare('SELECT d.name, COUNT(DISTINCT da.ad_id) AS ads, COUNT(DISTINCT dv.advertiser_id) AS advertisers FROM prospecting_databases d LEFT JOIN database_ads da ON da.database_id=d.id LEFT JOIN database_advertisers dv ON dv.database_id=d.id GROUP BY d.id ORDER BY d.name').all(); }
  useBase(name: string): void { this.baseId(name); this.db.prepare("INSERT INTO settings(key,value) VALUES ('default_db',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(name); }
  defaultBase(): string | null { return (this.db.prepare("SELECT value FROM settings WHERE key='default_db'").get() as { value: string } | undefined)?.value ?? null; }
  baseId(name: string): number { const row = this.db.prepare('SELECT id FROM prospecting_databases WHERE name=?').get(safeName(name)) as { id: number } | undefined; if (!row) throw new Error(`Base inexistente: ${name}`); return row.id; }
  stats(name: string): object { const id = this.baseId(name); return {
    base: name,
    ads: (this.db.prepare('SELECT COUNT(*) AS n FROM database_ads WHERE database_id=?').get(id) as { n: number }).n,
    advertisers: (this.db.prepare('SELECT COUNT(*) AS n FROM database_advertisers WHERE database_id=?').get(id) as { n: number }).n,
    provisionalAds: (this.db.prepare("SELECT COUNT(*) AS n FROM database_ads da JOIN ads a ON a.id=da.ad_id WHERE da.database_id=? AND a.advertiser_id LIKE 'provisional:ad:%'").get(id) as { n: number }).n,
    jobs: (this.db.prepare('SELECT COUNT(*) AS n FROM jobs WHERE database_id=?').get(id) as { n: number }).n
  }; }
  createJob(base: string, url: string, mode: Mode, method: Method, browser: string, limit: number): Job {
    const id = `job_${randomUUID()}`;
    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.db.prepare('INSERT OR IGNORE INTO searches(normalized_url) VALUES (?)').run(url);
      const searchId=(this.db.prepare('SELECT id FROM searches WHERE normalized_url=?').get(url) as {id:number}).id;
      this.db.prepare('INSERT INTO jobs(id,database_id,search_id,search_url,mode,method,browser,target_total,status) VALUES (?,?,?,?,?,?,?,?,?)')
        .run(id, this.baseId(base), searchId, url, mode, method, browser, limit, 'PARTIAL');
      this.db.prepare('INSERT INTO checkpoints(job_id,method,observed,unique_ads,new_advertisers,duplicate_ads,duplicate_advertisers,invalid) VALUES (?,?,0,0,0,0,0,0)').run(id,method);
      this.db.exec('COMMIT');
    } catch(e) {this.db.exec('ROLLBACK');throw e;}
    return this.job(id);
  }
  job(id: string): Job { const row = this.db.prepare('SELECT j.*, d.name AS db_name FROM jobs j JOIN prospecting_databases d ON d.id=j.database_id WHERE j.id=?').get(id) as Job | undefined; if (!row) throw new Error(`Trabajo inexistente: ${id}`); return row; }
  jobs(): Job[] { return this.db.prepare('SELECT j.*, d.name AS db_name FROM jobs j JOIN prospecting_databases d ON d.id=j.database_id ORDER BY j.started_at DESC').all() as unknown as Job[]; }
  setTarget(id: string, total: number): void { if (!Number.isSafeInteger(total) || total <= 0) throw new Error('Objetivo inválido'); this.db.prepare('UPDATE jobs SET target_total=? WHERE id=?').run(total,id); }
  acquire(id: string, owner: string): boolean { const expires = Date.now()+120000; this.db.prepare('DELETE FROM job_leases WHERE expires_at<?').run(Date.now()); return this.db.prepare('INSERT OR IGNORE INTO job_leases(job_id,owner,expires_at) VALUES (?,?,?)').run(id,owner,expires).changes === 1; }
  renew(id: string, owner: string): void { const result = this.db.prepare('UPDATE job_leases SET expires_at=? WHERE job_id=? AND owner=?').run(Date.now()+120000,id,owner); if (!result.changes) throw new Error('Lease perdido'); }
  release(id: string, owner: string): void { this.db.prepare('DELETE FROM job_leases WHERE job_id=? AND owner=?').run(id,owner); }
  status(id: string, status: Status, reason: string | null): void { this.db.prepare("UPDATE jobs SET status=?, reason=?, updated_at=CURRENT_TIMESTAMP, finished_at=CASE WHEN ?='RUNNING' THEN NULL ELSE CURRENT_TIMESTAMP END WHERE id=?").run(status,reason,status,id); }
  addError(id: string, code: string, reason: string): void { this.db.prepare('INSERT INTO record_errors(job_id,code,reason) VALUES (?,?,?)').run(id,code,reason.slice(0,500)); }
  persistBatch(id: string, ads: Ad[], cursor: string | null): Job {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const job = this.job(id);
      for (const ad of ads) {
        this.db.prepare('UPDATE jobs SET observed=observed+1 WHERE id=?').run(id);
        if (ad.quality === 'invalid') {
          this.addError(id, 'INVALID_AD', ad.qualityReason ?? 'Registro inválido');
          this.db.prepare('UPDATE jobs SET invalid=invalid+1 WHERE id=?').run(id);
          continue;
        }
        const confirmedPageId=ad.pageIdSource==='structured_json'?ad.metaPageId:null;
        const existing=this.db.prepare('SELECT advertiser_id,meta_page_id,meta_page_id_source FROM ads WHERE id=?').get(ad.adId) as
          {advertiser_id:string;meta_page_id:string|null;meta_page_id_source:string|null}|undefined;
        if (existing?.meta_page_id_source==='structured_json' && confirmedPageId && existing.meta_page_id !== confirmedPageId) {
          this.addError(id,'IDENTITY_CONFLICT',`El anuncio ${ad.adId} apareció con otra identidad de página`);
          this.db.prepare('UPDATE jobs SET invalid=invalid+1 WHERE id=?').run(id);
          const adNew=this.db.prepare('INSERT OR IGNORE INTO database_ads(database_id,ad_id,first_job_id) VALUES (?,?,?)').run(job.database_id,ad.adId,id).changes===1;
          const advNew=this.db.prepare('INSERT OR IGNORE INTO database_advertisers(database_id,advertiser_id,first_job_id) VALUES (?,?,?)')
            .run(job.database_id,existing.advertiser_id,id).changes===1;
          this.db.prepare('INSERT OR IGNORE INTO observations(job_id,ad_id) VALUES (?,?)').run(id,ad.adId);
          this.db.prepare('UPDATE jobs SET unique_ads=unique_ads+?,new_advertisers=new_advertisers+?,duplicate_ads=duplicate_ads+?,duplicate_advertisers=duplicate_advertisers+? WHERE id=?')
            .run(Number(adNew),Number(advNew),Number(!adNew),Number(!advNew),id);
          continue;
        }
        const pageId=confirmedPageId ?? (existing?.meta_page_id_source==='structured_json' ? existing.advertiser_id : `provisional:ad:${ad.adId}`);
        const metaPageId=confirmedPageId ?? (existing?.meta_page_id_source==='structured_json' ? existing.meta_page_id : null);
        this.db.prepare("INSERT INTO advertisers(id,name) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET name=CASE WHEN excluded.name<>'' THEN excluded.name ELSE advertisers.name END,last_seen_at=CURRENT_TIMESTAMP").run(pageId,ad.advertiserName);
        const advNew = metaPageId ? this.db.prepare('INSERT OR IGNORE INTO database_advertisers(database_id,advertiser_id,first_job_id) VALUES (?,?,?)').run(job.database_id,pageId,id).changes === 1 : false;
        this.db.prepare(`INSERT INTO ads(id,advertiser_id,meta_page_id,meta_page_id_source,advertiser_name,description,cta_url,library_url,country,platforms,ad_start_date,ad_status,cta_text,method,quality,quality_reason)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET advertiser_id=excluded.advertiser_id,
          advertiser_name=CASE WHEN excluded.advertiser_name<>'' THEN excluded.advertiser_name ELSE ads.advertiser_name END,
          description=COALESCE(excluded.description,ads.description),cta_url=COALESCE(excluded.cta_url,ads.cta_url),
          meta_page_id=excluded.meta_page_id,meta_page_id_source=excluded.meta_page_id_source,
          last_seen_at=CURRENT_TIMESTAMP,quality=excluded.quality,quality_reason=excluded.quality_reason`)
          .run(ad.adId,pageId,metaPageId,metaPageId?'structured_json':null,ad.advertiserName,ad.description,ad.ctaUrl,ad.libraryUrl,ad.country,ad.platforms ? JSON.stringify(ad.platforms) : null,
            ad.adStartDate,ad.adStatus,ad.ctaText,ad.method,ad.quality,ad.qualityReason);
        const merged=this.db.prepare('SELECT meta_page_id,advertiser_name,description FROM ads WHERE id=?').get(ad.adId) as
          {meta_page_id:string|null;advertiser_name:string;description:string|null};
        const missing=[!merged.meta_page_id&&'page_id_unavailable',!merged.advertiser_name&&'advertiser_name',!merged.description&&'description'].filter(Boolean).join(',');
        this.db.prepare('UPDATE ads SET quality=?,quality_reason=? WHERE id=?').run(missing?'partial':'valid',missing||null,ad.adId);
        const adNew = this.db.prepare('INSERT OR IGNORE INTO database_ads(database_id,ad_id,first_job_id) VALUES (?,?,?)').run(job.database_id,ad.adId,id).changes === 1;
        if(metaPageId) this.db.prepare(`INSERT OR IGNORE INTO database_advertisers(database_id,advertiser_id,first_job_id)
          SELECT database_id,?,first_job_id FROM database_ads WHERE ad_id=?`).run(pageId,ad.adId);
        this.db.prepare('INSERT OR IGNORE INTO observations(job_id,ad_id) VALUES (?,?)').run(id,ad.adId);
        this.db.prepare(`UPDATE jobs SET unique_ads=unique_ads+?,new_advertisers=new_advertisers+?,
          duplicate_ads=duplicate_ads+?,duplicate_advertisers=duplicate_advertisers+? WHERE id=?`)
          .run(Number(adNew),Number(advNew),Number(!adNew),Number(Boolean(metaPageId)&&!advNew),id);
      }
      this.db.prepare('UPDATE jobs SET cursor=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(cursor,id);
      this.db.prepare(`UPDATE checkpoints SET cursor=?,observed=(SELECT observed FROM jobs WHERE id=?),unique_ads=(SELECT unique_ads FROM jobs WHERE id=?),
        new_advertisers=(SELECT new_advertisers FROM jobs WHERE id=?),duplicate_ads=(SELECT duplicate_ads FROM jobs WHERE id=?),
        duplicate_advertisers=(SELECT duplicate_advertisers FROM jobs WHERE id=?),invalid=(SELECT invalid FROM jobs WHERE id=?),
        updated_at=CURRENT_TIMESTAMP WHERE job_id=?`).run(cursor,id,id,id,id,id,id,id);
      this.db.exec('COMMIT');
      return this.job(id);
    } catch (e) { this.db.exec('ROLLBACK'); throw e; }
  }
  adRows(id: string): object[] { return this.db.prepare(`SELECT a.*, a.quality AS extraction_status,
    j.search_url, o.observed_at, j.id AS run_id, CASE WHEN da.first_job_id=j.id THEN 1 ELSE 0 END AS is_new_to_base,
    (SELECT json_group_array(DISTINCT sj.search_url) FROM observations so JOIN jobs sj ON sj.id=so.job_id
      WHERE so.ad_id=a.id AND sj.database_id=j.database_id) AS source_searches
    FROM observations o JOIN ads a ON a.id=o.ad_id JOIN jobs j ON j.id=o.job_id
    JOIN database_ads da ON da.ad_id=a.id AND da.database_id=j.database_id WHERE o.job_id=? ORDER BY a.id`).all(id); }
  baseAdRows(name: string): object[] { const baseId=this.baseId(name); return this.db.prepare(`SELECT a.*,a.quality AS extraction_status,
    d.first_job_id AS run_id,j.search_url, 1 AS is_new_to_base,
    (SELECT json_group_array(DISTINCT sj.search_url) FROM observations so JOIN jobs sj ON sj.id=so.job_id
      WHERE so.ad_id=a.id AND sj.database_id=d.database_id) AS source_searches
    FROM database_ads d JOIN ads a ON a.id=d.ad_id
    JOIN jobs j ON j.id=d.first_job_id WHERE d.database_id=? ORDER BY a.id`).all(baseId); }
  advertiserRows(id: string): object[] { return this.db.prepare(`SELECT a.id AS advertiser_id,a.name AS advertiser_name,COUNT(o.ad_id) AS ads_observed,
    NULL AS landing_domains
    FROM observations o JOIN ads ad ON ad.id=o.ad_id JOIN advertisers a ON a.id=ad.advertiser_id
    WHERE o.job_id=? GROUP BY a.id ORDER BY a.id`).all(id); }
  errors(id: string): object[] { return this.db.prepare('SELECT code,reason,created_at FROM record_errors WHERE job_id=? ORDER BY id').all(id); }
  recordExport(id: string, path: string): void { this.db.prepare('INSERT INTO exports(job_id,path) VALUES (?,?)').run(id,path); }
}
