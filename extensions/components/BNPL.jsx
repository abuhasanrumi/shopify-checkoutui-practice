import { Grid, View, Image, Text, Divider, Link, Pressable, useSelectedPaymentOptions } from '@shopify/checkout-ui-extensions-react';

export default function BNPL({ data }) {
  const widgetData = JSON.parse(data?.widgets?.at(0)?.widget_customization)
  const options = useSelectedPaymentOptions();
  console.log(options)

  return (
    <Pressable onPress={() => console.log('hello')}>
      <Grid columns={['70%', 'auto', 'fill']} spacing='base' border='base' borderRadius='base' borderWidth='base' padding='base'>
        <View>
          <View maxInlineSize={78} maxBlockSize={30}>
            <Image source={widgetData?.bnplImage} />
          </View>
          <View padding='tight' />
          <Text>
            <Text size='large'>{widgetData?.largeText}</Text> {widgetData?.restText}
          </Text>
        </View>
        <View blockAlignment='center'>
          <Divider direction='block' />
        </View>
        <View blockAlignment='center'>
          <View inlineAlignment='center'>
            <Link to={widgetData?.learnMoreLink}>Learn more</Link>
          </View>
        </View>
      </Grid>
    </Pressable>
  )
}
