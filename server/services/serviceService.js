import db from '../db/mysql.js'

function hasChanged(oldRow, newRow) {
  if (!oldRow) return true;
  return (
    oldRow.name !== newRow.name ||
    oldRow.price !== newRow.price ||
    oldRow.min !== newRow.min ||
    oldRow.max !== newRow.max
  );
}

export async function insertServices(services, batchSize = 1000) {
  if (!services.length) return;

  // Mevcut servisleri bir Map olarak değil, veritabanından gerektiğinde parça parça çekerek işleyelim
  const total = services.length;
  for (let i = 0; i < total; i += batchSize) {
    const batch = services.slice(i, i + batchSize);

    // batch içindeki tüm site+service_id’leri al
    const keys = batch.map(s => [s.site, s.id]);

    const placeholders = keys.map(() => `(?, ?)`).join(',');
    const flatKeys = keys.flat();

    const [existingRows] = await db.query(
      `SELECT * FROM services WHERE (site, service_id) IN (${placeholders})`,
      flatKeys
    );

    const existingMap = new Map();
    existingRows.forEach(s => {
      const key = `${s.site}-${s.service_id}`;
      existingMap.set(key, s);
    });

    const insertList = [];
    const updateList = [];
    const logs = [];

    for (const s of batch) {
      const key = `${s.site}-${s.id}`;
      const existing = existingMap.get(key);

      if (!existing) {
        insertList.push([s.site, s.id, s.name, s.price, s.min, s.max]);
        logs.push([s.site, s.id, 'new', null, JSON.stringify(s)]);
      } else if (hasChanged(existing, s)) {
        updateList.push([s.site, s.id, s.name, s.price, s.min, s.max]);
        logs.push([
          s.site,
          s.id,
          'updated',
          JSON.stringify(existing),
          JSON.stringify(s)
        ]);
      }
    }

    if (insertList.length) {
      await db.query(
        `INSERT INTO services (site, service_id, name, price, min, max)
         VALUES ?`,
        [insertList]
      );
    }

    if (updateList.length) {
      await db.query(
        `INSERT INTO services (site, service_id, name, price, min, max)
         VALUES ?
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           price = VALUES(price),
           min = VALUES(min),
           max = VALUES(max),
           last_updated = CURRENT_TIMESTAMP`,
        [updateList]
      );
    }

    if (logs.length) {
      await db.query(
        `INSERT INTO service_logs (site, service_id, change_type, old_data, new_data)
         VALUES ?`,
        [logs]
      );
    }
  }
}



export async function getServicesWithPagination(limit = 1000) {
  const [rows] = await db.query(
    `SELECT * FROM services LIMIT ?`,
    [limit]
  )
  return rows
}
export async function getTwitterServices() {
  const [rows] = await db.query(
    `SELECT * 
     FROM services 
     WHERE LOWER(name) LIKE '%twitter%'
       AND LOWER(name) LIKE '%follow%'
     ORDER BY price DESC`
  )
  return rows
}

// export async function getTwitterServices() {
//   const [rows] = await db.query(
//     `SELECT * 
//      FROM services 
//      WHERE name LIKE '%Twitter%'`
//   )
//   return rows
// }
