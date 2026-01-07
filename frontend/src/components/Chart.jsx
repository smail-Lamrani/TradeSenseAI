import { useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'
import './Chart.css'

function Chart({ symbol }) {
    const chartContainerRef = useRef(null)
    const chartRef = useRef(null)

    useEffect(() => {
        if (!chartContainerRef.current) return

        // Create chart
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: 'solid', color: 'transparent' },
                textColor: '#a0aec0',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            crosshair: {
                mode: 1,
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                timeVisible: true,
                secondsVisible: false,
            },
            handleScroll: { vertTouchDrag: false },
        })

        chartRef.current = chart

        // Add candlestick series
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#10b981',
            downColor: '#ef4444',
            borderDownColor: '#ef4444',
            borderUpColor: '#10b981',
            wickDownColor: '#ef4444',
            wickUpColor: '#10b981',
        })

        // Generate sample data (in production, this would come from the API)
        const data = generateSampleData(symbol)
        candlestickSeries.setData(data)

        // Add volume series
        const volumeSeries = chart.addHistogramSeries({
            color: '#6366f1',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        })

        const volumeData = data.map(d => ({
            time: d.time,
            value: Math.random() * 1000000 + 500000,
            color: d.close >= d.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
        }))
        volumeSeries.setData(volumeData)

        // Fit content
        chart.timeScale().fitContent()

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: 400
                })
            }
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        return () => {
            window.removeEventListener('resize', handleResize)
            chart.remove()
        }
    }, [symbol])

    return (
        <div className="chart-wrapper">
            <div ref={chartContainerRef} className="chart-container" />
            <div className="chart-legend">
                <span className="legend-item up">● Hausse</span>
                <span className="legend-item down">● Baisse</span>
            </div>
        </div>
    )
}

// Generate sample OHLC data
function generateSampleData(symbol) {
    const data = []
    const basePrice = getBasePrice(symbol)
    let currentDate = new Date()
    currentDate.setDate(currentDate.getDate() - 90)

    let lastClose = basePrice

    for (let i = 0; i < 90; i++) {
        const volatility = 0.02
        const change = (Math.random() - 0.48) * volatility

        const open = lastClose
        const close = open * (1 + change)
        const high = Math.max(open, close) * (1 + Math.random() * 0.01)
        const low = Math.min(open, close) * (1 - Math.random() * 0.01)

        data.push({
            time: currentDate.toISOString().split('T')[0],
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
        })

        lastClose = close
        currentDate.setDate(currentDate.getDate() + 1)
    }

    return data
}

function getBasePrice(symbol) {
    const prices = {
        'AAPL': 178,
        'TSLA': 248,
        'MSFT': 378,
        'GOOGL': 141,
        'NVDA': 495,
        'BTC-USD': 43500,
        'ETH-USD': 2280,
        'IAM': 120,
        'ATW': 485,
    }
    return prices[symbol] || 100
}

export default Chart
