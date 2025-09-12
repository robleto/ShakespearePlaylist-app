import { prisma } from '../db'
import type { Source } from '@prisma/client'

export async function getAllSources() {
  return prisma.source.findMany({
    include: {
  company: true, // includes listingsPageUrl if present in schema
    },
    orderBy: { lastRunAt: 'desc' },
  })
}

export async function getEnabledSources() {
  return prisma.source.findMany({
    where: { enabled: true },
    include: {
      company: true,
    },
  })
}

export async function updateSourceStatus(
  sourceId: string,
  status: string,
  etag?: string,
  lastModified?: string
) {
  return prisma.source.update({
    where: { id: sourceId },
    data: {
      lastRunAt: new Date(),
      lastStatus: status,
      etag,
      lastModified,
    },
  })
}

export async function enableSource(sourceId: string) {
  return prisma.source.update({
    where: { id: sourceId },
    data: { enabled: true },
  })
}

export async function disableSource(sourceId: string) {
  return prisma.source.update({
    where: { id: sourceId },
    data: { enabled: false },
  })
}

export async function createSource(data: {
  companyId: string
  url: string
  kind: 'ICS' | 'JSONLD' | 'HTML'
  parserName: string
}) {
  return prisma.source.create({
    data,
  })
}

export async function getSourcesByCompany(companyId: string) {
  return prisma.source.findMany({
    where: { companyId },
    include: {
      company: true,
    },
  })
}
