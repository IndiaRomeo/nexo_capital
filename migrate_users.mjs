import { createClient } from '@supabase/supabase-js'

const OLD_URL = 'https://ibnywpnbqzijrtohjyqc.supabase.co'
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlibnl3cG5icXppanJ0b2hqeXFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzkzOTI3MiwiZXhwIjoyMDkzNTE1MjcyfQ.qmro4wCidSb2btB5X94_VGVzOgmFoXQMQ7qBHcrOaOc'
const NEW_URL = 'https://bihdqhthhcnhfugldzrp.supabase.co'
const NEW_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpaGRxaHRoaGNuaGZ1Z2xkenJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA2NDMzNywiZXhwIjoyMDk1NjQwMzM3fQ.OAjAx0HX9DpYoUVqTB1ARM0eo5VDNHIiS9VJGRZnReQ'

const oldDB = createClient(OLD_URL, OLD_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
const newDB = createClient(NEW_URL, NEW_KEY, { auth: { autoRefreshToken: false, persistSession: false } })

async function run() {
  // Get all users from old project
  const { data, error } = await oldDB.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) { console.error('Error al leer usuarios:', error); return }

  const users = data.users
  console.log(`Encontrados ${users.length} usuarios en impulso_latino\n`)

  let created = 0, skipped = 0, errors = 0

  for (const user of users) {
    if (!user.email) { skipped++; continue }

    // Random temp password — users will use "Forgot Password" to log in
    const tempPass = 'Nx' + Math.random().toString(36).slice(2, 10) + '1!'

    const { error: createErr } = await newDB.auth.admin.createUser({
      email: user.email,
      email_confirm: true,
      password: tempPass,
      user_metadata: user.user_metadata || {}
    })

    if (createErr) {
      if (createErr.status === 422 || createErr.message?.includes('already')) {
        skipped++
        process.stdout.write(`  ⟳ ya existe: ${user.email}\n`)
      } else {
        errors++
        process.stdout.write(`  ✗ error: ${user.email} → ${createErr.message}\n`)
      }
    } else {
      created++
      process.stdout.write(`  ✓ creado: ${user.email}\n`)
    }

    await new Promise(r => setTimeout(r, 120)) // avoid rate limit
  }

  console.log(`\n=== Resultado ===`)
  console.log(`✓ Creados:  ${created}`)
  console.log(`⟳ Ya existían: ${skipped}`)
  console.log(`✗ Errores:  ${errors}`)
  console.log(`\nLos usuarios deben usar "Olvidé mi contraseña" en la app para activar su cuenta.`)
}

run()
