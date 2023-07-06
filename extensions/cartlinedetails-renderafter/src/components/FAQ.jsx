import { useState } from 'react';
import { useExtensionApi, Heading, Icon, Grid, TextBlock, BlockSpacer, Divider, Pressable, View } from '@shopify/checkout-ui-extensions-react';

const faqIds = ['1d1c8a20-48b3-49fb-9914-7dd982eb33d9', 'abe8dd12-e108-4a5b-8407-ce412daeb551', '3e9bc4b4-9887-47ca-8cc3-88f24be64cd3', '3877a333-4bd3-4a6f-9e98-5cf931c4b983', 'b0606b96-2240-4a21-879c-156d74872e06']
export default function FAQ({ data }) {
    const { extensionPoint } = useExtensionApi()
    const [open, setOpen] = useState(Array.from({ length: 3 }, i => i = false))
    const faqs = JSON.parse(data.widgets.find(widget => widget.widget_position === extensionPoint)?.widget_customization)?.faqs
    const faqTitle = JSON.parse(data.widgets.find(widget => widget.widget_position === extensionPoint)?.widget_customization)?.title

    return (
        <>
            <Heading level={2}>{faqTitle.faq || 'Frequently asked questions'}</Heading>
            <BlockSpacer />
            <Divider size="base" />
            <BlockSpacer />
            {
                faqs.map((faq, j) => {
                    return <View key={faqIds[j]}>
                        <Grid
                            columns={['fill', 'auto']}
                            spacing="none"
                        >
                            <Pressable onPress={() => {
                                const oldState = JSON.parse(JSON.stringify(open))
                                oldState.splice(j, 1, !oldState[j])
                                setOpen(oldState)
                            }}>
                                <TextBlock emphasis="bold">{faq.q}</TextBlock>
                            </Pressable>
                            <Pressable onPress={() => {
                                const oldState = JSON.parse(JSON.stringify(open))
                                oldState.splice(j, 1, !oldState[j])
                                setOpen(oldState)
                            }}>
                                <Icon source={open[j] ? 'close' : 'plus'} />
                            </Pressable>
                        </Grid>
                        <BlockSpacer />
                        {
                            open[j] &&
                            <>
                                <TextBlock>{faq.a}</TextBlock>
                                <BlockSpacer />
                            </>
                        }
                        <Divider size="base" />
                        <BlockSpacer />
                    </View>
                })
            }
        </>
    )
}