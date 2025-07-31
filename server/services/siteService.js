// services/siteService.js
import db from '../db/mysql.js'

export async function getAllSites() {
  const [rows] = await db.query('SELECT * FROM sites')
  return rows
}

export async function getSiteById(id) {
  const [rows] = await db.query('SELECT * FROM sites WHERE id = ?', [id])
  return rows[0]
}

export async function createSite({ domain, path, categoryClass }) {
  const [result] = await db.query(
    'INSERT INTO sites (domain, path, categoryClass) VALUES (?, ?, ?)',
    [domain, path, categoryClass]
  )

  return {
    id: result.insertId,
    domain,
    path,
    categoryClass
  }
}



export async function updateSite({ id, domain, path, rowClass, categoryClass }) {
  await db.query(
  'UPDATE sites SET domain = ?, path = ?, categoryClass = ? WHERE id = ?',
  [domain, path, categoryClass, id]
)


  return getSiteById(id)
}


export async function deleteSite(id) {
  await db.query('DELETE FROM sites WHERE id = ?', [id])
}
