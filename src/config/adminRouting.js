export const DEFAULT_ADMIN_ID = 'd5b2d17c-2177-45d4-a8cb-479c0a68fa48'
export const CONTACT_MESSAGES_ADMIN_ID = 'de4c7784-f1ef-45c9-ba13-6dd91d4b0215'

export const ADMIN_ROUTES = [
  {
    id: DEFAULT_ADMIN_ID,
    slug: 'admin1',
    whatsapp: '19472804624',
    whatsappLabel: '+1 (947) 280-4624',
  },
  {
    id: 'de4c7784-f1ef-45c9-ba13-6dd91d4b0215',
    slug: 'camilo',
    whatsapp: '19472804624',
    whatsappLabel: '+1 (947) 280-4624',
  },
]

export const ADMIN_ROUTES_BY_ID = new Map(ADMIN_ROUTES.map(admin => [admin.id, admin]))
export const ADMIN_ROUTES_BY_SLUG = new Map(ADMIN_ROUTES.map(admin => [admin.slug, admin]))

export function getDefaultAdminRoute() {
  return ADMIN_ROUTES_BY_ID.get(DEFAULT_ADMIN_ID) || ADMIN_ROUTES[0]
}

export function getContactMessagesAdminRoute() {
  return ADMIN_ROUTES_BY_ID.get(CONTACT_MESSAGES_ADMIN_ID) || getDefaultAdminRoute()
}

export function getAdminRouteById(adminId) {
  return ADMIN_ROUTES_BY_ID.get(adminId) || null
}

export function resolveAdminRoute(searchParams) {
  const advisorSlug = searchParams.get('asesor')
  if (advisorSlug && ADMIN_ROUTES_BY_SLUG.has(advisorSlug)) {
    return ADMIN_ROUTES_BY_SLUG.get(advisorSlug)
  }

  const adminId = searchParams.get('admin')
  if (adminId && ADMIN_ROUTES_BY_ID.has(adminId)) {
    return ADMIN_ROUTES_BY_ID.get(adminId)
  }

  return getDefaultAdminRoute()
}
