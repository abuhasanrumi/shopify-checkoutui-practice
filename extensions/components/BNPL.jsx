import { Grid, View, Image, Text, Divider, Link } from '@shopify/checkout-ui-extensions-react';

export default function BNPL({ data }) {
  const widgetData = JSON.parse(data?.widgets?.at(0)?.widget_customization)

  return (
    <Grid columns={['70%', 'auto', 'fill']} spacing='base' border='base' borderRadius='base' borderWidth='base' padding='base'>
      <View>
        <Image source={widgetData?.bnplImage} />
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
  )
}
