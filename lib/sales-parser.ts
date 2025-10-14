export interface SalesRecord {
  date: string
  product: string
  quantity: number
  unitPrice: number
  channel: string
  customer: string
  status: string
  totalAmount: number
}

export interface SalesMetrics {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  conversionRate: number
  revenueGrowth: number
}

export interface ProductPerformance {
  name: string
  revenue: number
  units: number
  growth: number
}

export interface ChannelDistribution {
  name: string
  value: number
  color: string
}

export interface SalesAnalytics {
  records: SalesRecord[]
  metrics: SalesMetrics
  timeSeriesData: {
    date: string
    sales: number
    orders: number
    visitors: number
  }[]
  productPerformance: ProductPerformance[]
  channelDistribution: ChannelDistribution[]
  conversionFunnel: {
    stage: string
    count: number
    percentage: number
  }[]
  aiInsights: string
}

const CHANNEL_COLORS: Record<string, string> = {
  Website: '#3b82f6', // Blue
  'Mobile App': '#10b981', // Green
  Marketplace: '#f59e0b', // Orange
  Social: '#8b5cf6', // Purple
}

export function parseSalesCSV(csvContent: string): SalesAnalytics {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',').map((h) => h.trim())

  // Parse records
  const records: SalesRecord[] = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim())
    const record: any = {}

    headers.forEach((header, index) => {
      const key = header.toLowerCase().replace(/\s+/g, '')
      let value: any = values[index]

      // Parse numbers
      if (key === 'quantity') {
        value = parseInt(value) || 0
      } else if (key === 'unitprice') {
        value = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0
      }

      record[key] = value
    })

    return {
      date: record.date,
      product: record.product,
      quantity: record.quantity,
      unitPrice: record.unitprice,
      channel: record.channel,
      customer: record.customer,
      status: record.status,
      totalAmount: record.quantity * record.unitprice,
    }
  })

  // Calculate metrics
  const totalRevenue = records.reduce((sum, r) => sum + r.totalAmount, 0)
  const totalOrders = records.length

  // Group by week for time series
  const weeklyData = groupByWeek(records)

  // Calculate product performance
  const productMap = new Map<string, { revenue: number; units: number; ordersByWeek: number[] }>()

  records.forEach((record, index) => {
    const weekIndex = Math.floor(index / 7)
    if (!productMap.has(record.product)) {
      productMap.set(record.product, { revenue: 0, units: 0, ordersByWeek: [] })
    }
    const product = productMap.get(record.product)!
    product.revenue += record.totalAmount
    product.units += record.quantity

    // Track weekly orders for growth calculation
    if (!product.ordersByWeek[weekIndex]) {
      product.ordersByWeek[weekIndex] = 0
    }
    product.ordersByWeek[weekIndex]++
  })

  const productPerformance: ProductPerformance[] = Array.from(productMap.entries())
    .map(([name, data]) => {
      // Calculate growth: compare last week to first week
      const firstWeekOrders = data.ordersByWeek[0] || 1
      const lastWeekOrders = data.ordersByWeek[data.ordersByWeek.length - 1] || 0
      const growth = Math.round(((lastWeekOrders - firstWeekOrders) / firstWeekOrders) * 100)

      return {
        name,
        revenue: data.revenue,
        units: data.units,
        growth,
      }
    })
    .sort((a, b) => b.revenue - a.revenue)

  // Calculate channel distribution
  const channelMap = new Map<string, number>()
  records.forEach((record) => {
    channelMap.set(record.channel, (channelMap.get(record.channel) || 0) + record.totalAmount)
  })

  const channelDistribution: ChannelDistribution[] = Array.from(channelMap.entries())
    .map(([name, revenue]) => ({
      name,
      value: Math.round((revenue / totalRevenue) * 100),
      color: CHANNEL_COLORS[name] || '#6b7280',
    }))
    .sort((a, b) => b.value - a.value)

  // Generate AI insights
  const topProduct = productPerformance[0]
  const fastestGrowingProduct = [...productPerformance].sort((a, b) => b.growth - a.growth)[0]
  const topChannel = channelDistribution[0]
  const avgOrderValue = totalRevenue / totalOrders
  const revenueGrowth = calculateGrowth(weeklyData)

  const aiInsights = `
    <strong class="text-foreground">Strong Growth Detected:</strong> Your sales have increased ${revenueGrowth}% 
    over the analyzed period. ${fastestGrowingProduct.name} is your fastest-growing product (+${fastestGrowingProduct.growth}%). 
    ${topChannel.name} generates ${topChannel.value}% of revenue. Consider increasing marketing spend here. 
    Your average order value of $${avgOrderValue.toFixed(2)} shows healthy pricing.
  `.trim()

  // Mock conversion funnel based on industry averages
  const visitors = totalOrders * 12.5 // Assuming 8% conversion
  const conversionFunnel = [
    { stage: 'Visitors', count: Math.round(visitors), percentage: 100 },
    { stage: 'Product Views', count: Math.round(visitors * 0.57), percentage: 57 },
    { stage: 'Add to Cart', count: Math.round(visitors * 0.21), percentage: 21 },
    { stage: 'Checkout', count: Math.round(visitors * 0.12), percentage: 12 },
    { stage: 'Purchase', count: totalOrders, percentage: 8 },
  ]

  return {
    records,
    metrics: {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      conversionRate: 8.0,
      revenueGrowth,
    },
    timeSeriesData: weeklyData,
    productPerformance,
    channelDistribution,
    conversionFunnel,
    aiInsights,
  }
}

function groupByWeek(records: SalesRecord[]) {
  const weekMap = new Map<string, { sales: number; orders: number }>()

  records.forEach((record) => {
    const date = new Date(record.date)
    const weekStart = getWeekStart(date)
    const weekKey = formatDate(weekStart)

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, { sales: 0, orders: 0 })
    }

    const week = weekMap.get(weekKey)!
    week.sales += record.totalAmount
    week.orders += 1
  })

  return Array.from(weekMap.entries())
    .map(([date, data]) => ({
      date,
      sales: Math.round(data.sales),
      orders: data.orders,
      visitors: data.orders * 12, // Estimate visitors
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function getWeekStart(date: Date): Date {
  const day = date.getDay()
  const diff = date.getDate() - day
  return new Date(date.setDate(diff))
}

function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getDate()}`
}

function calculateGrowth(data: { sales: number }[]): number {
  if (data.length < 2) return 0
  const firstWeek = data[0].sales
  const lastWeek = data[data.length - 1].sales
  return Math.round(((lastWeek - firstWeek) / firstWeek) * 100)
}

