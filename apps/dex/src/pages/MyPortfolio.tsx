import React, { useState } from 'react';
import { useAccount, useBalance as useBalanceWagmi, useChainId } from 'wagmi';
import { Box, Card, CardContent, Typography, Grid, ToggleButton, ToggleButtonGroup, useMediaQuery, useTheme } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { PieChart } from '@mui/x-charts';
import { getCurrencies } from '../utils';
import { useFarmingStakers } from '../hooks/useFarmingStakers';
import { useTokenBalances } from '../hooks/useTokenBalances';
import { usePools } from '../hooks/usePools';
import { usePricedPools } from '../hooks/usePricesPools';
import { useFetchPrices } from '../hooks/usePrices';
import { muiDarkTheme, theme } from '../theme/theme';

type View = 'liquidity' | 'farming' | 'holdings';
type TimeFrame = '7days' | '1month' | '3months' | '6months' | '1year' | 'all';

export function MyPortfolio() {
  const th = useTheme();

  const between900And1150 = useMediaQuery(th.breakpoints.between(900, 1150));

  const chainId = useChainId();

  const farms = useFarmingStakers();
  const pools = usePools();

  const { isConnected } = useAccount();

  const { data: pricesData, error: errorPricesData, isLoading } = useFetchPrices();

  const account = useAccount();
  const { data: accountBalance } = useBalanceWagmi({ 
    address: account.address
  });
  
  console.log('🚀 ~ accountBalance', accountBalance?.value.toString() || '0');

  const tokens = getCurrencies(chainId)
  const { balances: tokensBalance } = useTokenBalances();
  const assetsChartData = usePricedPools();
  console.log("🚀 ~ MyPortfolio ~ pricedPools:", assetsChartData)

  const [selectedView, setSelectedView] = useState('liquidity');
  const [liquidityTimeFrame, setLiquidityTimeFrame] = useState<TimeFrame>('7days');
  const [holdingsTimeFrame, setHoldingsTimeFrame] = useState<TimeFrame>('7days');

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newView: View) => {
    if (newView !== null) {
      setSelectedView(newView);
    }
  };

  const handleLiquidityTimeFrameChange = (_event: React.MouseEvent<HTMLElement>, newTimeFrame: TimeFrame) => {
    if (newTimeFrame !== null) {
      setLiquidityTimeFrame(newTimeFrame);
    }
  };

  const handleHoldingsTimeFrameChange = (_event: React.MouseEvent<HTMLElement>, newTimeFrame: TimeFrame) => {
    if (newTimeFrame !== null) {
      setHoldingsTimeFrame(newTimeFrame);
    }
  };


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (errorPricesData) {
    return <div>Error Loading Prices</div>;
  }

  return (
    <ThemeProvider theme={muiDarkTheme}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', marginY: 4, paddingX: 2 }}>
        <Box>
          <Typography sx={{typography: 'h3'}} fontWeight="bold" color="white" gutterBottom>
            MY Portfolio
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card sx={{ color: 'white', flexGrow: 1, marginBottom: '8px' }}>
              <CardContent>
                <Typography variant="h6" mb={1}>Portfolio Value</Typography>
                <Typography variant="h3">0.00 ETH</Typography>
                <Typography variant="h5" color={theme?.colors.gray155}>~$0.00</Typography>

                {!isConnected && (<Typography variant="body2" color={theme?.colors.red400} textAlign="center" mt={2}>No wallet connected. Please connect your MetaMask.</Typography>)}
              </CardContent>
            </Card>

            <Card sx={{ color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Wallet Overview</Typography>
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 400,
                  width: '100%',
                  m: 0,
                  p: 0,
                }}>
                  {isConnected && (
                    <PieChart
                      margin={ between900And1150 ? { top: 65, bottom: 220, left: 125, right: 150 } : { top: 100, bottom: 100, left: 10, right: 150 } }
                      series={[
                        {
                          data: assetsChartData,
                          innerRadius: 30,
                          outerRadius: 90,
                        }
                      ]}
                      slotProps={{
                        legend: {
                          direction: between900And1150 ? 'row' : 'column',
                          position: {
                            vertical: between900And1150 ? 'bottom' : 'middle',
                            horizontal: between900And1150 ? 'middle' : 'right',
                          },
                          padding: 0,
                        },
                      }}
                      style={{ 
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        m: 0,
                        p: 0
                      }}
                    />
                  )}

                  {!isConnected && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 350,
                        width: '100%'
                      }}
                    >
                      <Typography variant="body2" color="white">No tokens in your wallet</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card sx={{ color: 'white', height: '100%' }}>
              <CardContent>
                <ToggleButtonGroup
                  color='primary'
                  value={selectedView}
                  onChange={handleViewChange}
                  sx={{ mt: 1, marginBottom: 2 }}
                  size='large'
                  exclusive
                  fullWidth
                >
                  <ToggleButton value="liquidity">Liquidity Value</ToggleButton>
                  <ToggleButton value="farming">Earned Farming Rewards</ToggleButton>
                  <ToggleButton value="holdings">Top Holdings Prices</ToggleButton>
                </ToggleButtonGroup>

                {isConnected && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sx={{ mt: 1 }}>
                      {selectedView === 'liquidity' && (
                        <>
                          <Box sx={{
                            display: 'flex',
                            alignContent: 'center',
                            alignItems: 'last baseline',
                            justifyContent: 'space-between',
                          }}>
                            <Typography variant="body2">ETH Value of Your LPs.</Typography>
                            <ToggleButtonGroup
                              color="primary"
                              value={liquidityTimeFrame}
                              onChange={handleLiquidityTimeFrameChange}
                              size='small'
                              exclusive
                            >
                              <ToggleButton value="7days">7 Days</ToggleButton>
                              <ToggleButton value="1month">1 Month</ToggleButton>
                              <ToggleButton value="3months">3 Months</ToggleButton>
                              <ToggleButton value="6months">6 Months</ToggleButton>
                              <ToggleButton value="1year">1 Year</ToggleButton>
                              <ToggleButton value="all">All Time</ToggleButton>
                            </ToggleButtonGroup>

                            {/* <Box sx={{ flexGrow: 1 }}>
                              <SparkLineChart data={[1, 4, 2, 5, 7, 4, 6]} height={100} />
                            </Box> */}
                          </Box>
                          {isConnected && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 450,
                                width: '100%'
                              }}
                            >
                              <Typography variant="body2" color="white">No data to show</Typography>
                            </Box>
                          )}
                        </>
                      )}
                      {selectedView === 'farming' && (
                        <>
                          <Typography variant="body2"  marginY={1}>ADA value of your total earned farming rewards for all time per epoch.</Typography>
                          {isConnected && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 450,
                                width: '100%'
                              }}
                            >
                              <Typography variant="body2" color="white">No data to show</Typography>
                            </Box>
                          )}
                        </>
                      )}
                      {selectedView === 'holdings' && (
                        <>
                          <Box sx={{
                            display: 'flex',
                            alignContent: 'center',
                            alignItems: 'last baseline',
                            justifyContent: 'space-between',
                          }}>
                            <Typography variant="body2">Your top tokens price development over time.</Typography>
                            <ToggleButtonGroup
                              color="primary"
                              value={holdingsTimeFrame}
                              onChange={handleHoldingsTimeFrameChange}
                              size='small'
                              exclusive
                            >
                              <ToggleButton value="7days">7 Days</ToggleButton>
                              <ToggleButton value="1month">1 Month</ToggleButton>
                              <ToggleButton value="3months">3 Months</ToggleButton>
                              <ToggleButton value="6months">6 Months</ToggleButton>
                              <ToggleButton value="1year">1 Year</ToggleButton>
                              <ToggleButton value="all">All Time</ToggleButton>
                            </ToggleButtonGroup>

                          </Box>
                          {/* TODO: move in wallet overview page */}
                          {isConnected && (
                            <Box
                              sx={{
                                height: 450,
                                width: '100%'
                              }}
                            >
                              <Typography variant="h6" mt={1} mb={1}>Tokens Balance</Typography>

                              {tokensBalance && tokensBalance.map((crypto, index) => (
                                <Typography key={index} variant="body2">{crypto?.symbol} {crypto?.balance?.toString()}</Typography>
                              ))}
                            </Box>
                          )}
                        </>
                      )}
                    </Grid>
                  </Grid>
                )}

                {!isConnected && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 450,
                      width: '100%'
                    }}
                  >
                    <Typography variant="body2" color="white">No data to show</Typography>
                  </Box>
                )}

                {/* <Typography variant="body2">No data to show</Typography> */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* <Grid container spacing={2} marginTop={4}>
          <Grid item xs={12} sm={4} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>CoinMarketCap Prices</Typography>
                {pricesData && pricesData.map((crypto, index) => (
                  <Typography key={index} variant="body2">{`1 ${crypto.symbol} = ${parseFloat(crypto.price).toFixed(2)} USD`}</Typography>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={8} md={9}>
            <Card>
              <CardContent>
                <Typography variant="h4">Your Farms</Typography>
                <MyFarmingTable farms={farms} isConnected={isConnected} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h4">Your Pools</Typography>
                <MyPoolsTable pools={pools} isConnected={isConnected} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box>
              <Typography variant="h4" color="white" gutterBottom>
                Your Liquidity
              </Typography>
            </Box>
            
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4} md={3}>
                <Card style={{ marginBottom: '8px' }}>
                  <CardContent>
                    <Typography variant="body1" gutterBottom>
                      TOTAL LIQUIDITY (info: not in farms, not in staking)
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" gutterBottom>
                      ~$0.00 - No data available
                    </Typography>
                  </CardContent>
                </Card>
                <Card style={{ marginBottom: '8px' }}>
                  <CardContent>
                    <Typography variant="body1" gutterBottom>
                      TOTAL LIQUIDITY NOT IN FARMS: (info: liquidity + LP)
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" gutterBottom>
                      -
                    </Typography>
                  </CardContent>
                </Card>
                <Card style={{ marginBottom: '8px' }}>
                  <CardContent>
                    <Typography variant="body1" gutterBottom>
                      TOTAL LP NOT IN FARMS: (info: LP)
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" gutterBottom>
                      -
                    </Typography>
                  </CardContent>
                </Card>
                <Card style={{ marginBottom: '8px' }}>
                  <CardContent>
                    <Typography variant="body1" gutterBottom>
                      ACTIVE LIQUIDITY POSITIONS:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" gutterBottom>
                      -
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid> */}

      </Box>
    </ThemeProvider>
  );
}
