import { useExtensionApi, Image, View } from '@shopify/checkout-ui-extensions-react';

export default function Banner({ data }) {
    const { extensionPoint } = useExtensionApi()
    const widgetData = JSON.parse(data?.widgets?.find(widget => widget.widget_position === extensionPoint)?.widget_customization)

    return (
        <View inlineAlignment='center'>
            <Image source={widgetData?.banner} />
        </View>
    )
}