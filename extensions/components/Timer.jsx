import { useEffect, useState } from 'react';
import { Text, TextBlock, View, Grid, BlockStack } from '@shopify/checkout-ui-extensions-react';

export default function Timer({ data }) {
  const fixedTime = JSON.parse(data?.widgets?.at(0)?.widget_customization)?.time
  const [time, setTime] = useState(fixedTime)

  useEffect(() => {
    const timer = setInterval(() => setTime(state => state - 1), 1000)
    const clearTimer = setTimeout(() => clearInterval(timer), ((fixedTime + 1) * 1000))

    return () => {
      clearTimeout(clearTimer)
      clearInterval(timer)
    }
  }, [])

  console.log(time)
  if (time <= 0) return <></>
  else return (
    <>
      <BlockStack border='base' borderRadius='base' borderWidth='base' padding='base'>
        <View inlineAlignment='center'>
          <Text emphasis='bold'>Your cart is reserved for</Text>
        </View>
        <Grid columns={Array.from({ length: 4 }, () => 'fill')} spacing='base'>
          <View border='base' borderRadius='base' borderWidth='base' inlineAlignment='center' blockAlignment='center'>
            <View padding='tight' />
            <TextBlock emphasis='bold' size='large'>00</TextBlock>
            <Text>Day</Text>
            <View padding='tight' />
          </View>

          <View border='base' borderRadius='base' borderWidth='base' inlineAlignment='center' blockAlignment='center'>
            <View padding='tight' />
            <TextBlock emphasis='bold' size='large'>00</TextBlock>
            <Text>Hour</Text>
            <View padding='tight' />
          </View>

          <View border='base' borderRadius='base' borderWidth='base' inlineAlignment='center' blockAlignment='center'>
            <View padding='tight' />
            <TextBlock appearance='info' emphasis='bold' size='large'>{`${Math.floor(time / 60) > 9 ? '' : '0'}${Math.floor(time / 60)}`}</TextBlock>
            <Text appearance='info'>{`Minute${(Math.floor(time / 60) ? 's' : '')}`}</Text>
            <View padding='tight' />
          </View>

          <View border='base' borderRadius='base' borderWidth='base' inlineAlignment='center' blockAlignment='center'>
            <View padding='tight' />
            <TextBlock appearance='critical' emphasis='bold' size='large'>{(time % 60).toString().length === 1 ? `0${time % 60}` : time % 60}</TextBlock>
            <Text appearance='critical'>{`Second${(Math.floor(time % 60) ? 's' : '')}`}</Text>
            <View padding='tight' />
          </View>
        </Grid>
      </BlockStack>
    </>
  )
}
