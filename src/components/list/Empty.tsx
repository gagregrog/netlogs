import React, { FC } from 'react';
import { isExtension, isMacOs, mediaQuerySmallOnly } from 'utils';
import { Link } from '../Link';
import { Theme } from 'theme/types';
import { i18n } from 'translations/i18n';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

const fixedLine = (theme: Theme) =>
    ({
        margin: '0.5em 0',
        position: 'fixed',
        backgroundColor: theme.mainBg,
        padding: '4px 6px 4px 4px',
        border: `1px dashed ${theme.inactiveTag}`,
        borderRadius: '4px'
    }) as const;

const fixedLinePointer = (theme: Theme, direction: 'top' | 'bottom') =>
    ({
        content: '""',
        position: 'absolute',
        borderLeft: '8px solid transparent',
        ...(direction === 'top' && {
            borderTop: `8px solid ${theme.inactiveTag}`
        }),
        ...(direction === 'bottom' && {
            borderBottom: `8px solid ${theme.inactiveTag}`
        }),
        borderRight: '8px solid transparent'
    }) as const;

const Section = styled.section({
    marginTop: '36px'
});

const Columns = styled.div({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    padding: '0 16px',
    [mediaQuerySmallOnly]: {
        gridTemplateColumns: '1fr'
    }
});

const Column = styled.div({
    display: 'flex',
    alignItems: 'start',
    justifyContent: 'center',
    flexDirection: 'column'
});

const hotkeysStyle = css`
    align-items: center;
`;

const NoItemsLine = styled.p({
    margin: '0.5em 0',
    width: '100%',
    textAlign: 'center',
    padding: '8px 0',
    display: 'block!important',
    fontSize: '1.4em'
});

const Line = styled.p({
    margin: '0.5em 0'
});

const ThemeLine = styled.p(({ theme }) => ({
    ...fixedLine(theme),
    bottom: '32px',
    right: '8px',
    '&::after': {
        ...fixedLinePointer(theme, 'top'),
        bottom: '-8px',
        right: '82px'
    }
}));

const LanguageLine = styled.p(({ theme }) => ({
    ...fixedLine(theme),
    top: '32px',
    right: '8px',
    '&::after': {
        ...fixedLinePointer(theme, 'bottom'),
        top: '-8px',
        right: '22px'
    }
}));

const WebsocketLine = styled.p(({ theme }) => ({
    ...fixedLine(theme),
    top: '32px',
    left: '8px',
    '&::after': {
        ...fixedLinePointer(theme, 'bottom'),
        top: '-8px',
        left: '27px'
    }
}));

// <NewBlock>New</NewBlock>
const _NewBlock = styled.span(({ theme }) => ({
    color: theme.mainBg,
    backgroundColor: 'orange',
    content: 'close-quote',
    padding: '2px 4px',
    borderRadius: '4px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '9px'
}));

const fruitSalad = 'obviously';

const url =
    'https://chrome.google.com/webstore/detail/net-logs/cjdmhjppaehhblekcplokfdhikmalnaf';
export const Empty: FC = () => {
    const modifierKey = isMacOs() ? '⌘' : 'Ctrl';

    if (fruitSalad) {
        return <FruitSalad />;
    }

    return (
        <Section>
            <NoItemsLine>👀 {i18n.t('noItems')} 👀</NoItemsLine>
            <Columns>
                <Column css={hotkeysStyle}>
                    <p>
                        {i18n.t('focusSearch')}: <kbd>{modifierKey}</kbd>+
                        <kbd>F</kbd>
                    </p>
                    <p>
                        {i18n.t('clearLog')}: <kbd>{modifierKey}</kbd>+
                        <kbd>K</kbd>
                    </p>
                    <p>
                        {i18n.t('toggleUnrelated')}: <kbd>{modifierKey}</kbd>+
                        <kbd>Shift</kbd>+<kbd>U</kbd>
                    </p>
                    <p>
                        {i18n.t('togglePreserve')}: <kbd>{modifierKey}</kbd>+
                        <kbd>P</kbd>
                    </p>
                </Column>
                <Column>
                    <Line>
                        ⛰️ <Link href='https://nextjs.org/' text='Next' />
                        /
                        <Link href='https://nuxt.com/' text='Nuxt' />{' '}
                        {i18n.t('nextHelper')}
                    </Line>
                    <Line>👆 {i18n.t('timeHelper')}</Line>
                    <Line>
                        📖 {i18n.t('readmeHelper')}{' '}
                        <Link
                            href='https://github.com/Artboomy/netlogs#readme'
                            text={i18n.t('here')}
                        />
                    </Line>
                    <Line>
                        📦 {i18n.t('dropHelper', { name: 'HAR/netlogs.zip' })}
                    </Line>
                    <Line>
                        ❤️ {i18n.t('shareHelper')} -{' '}
                        <Link href={url} text={i18n.t('share')} />{' '}
                        {i18n.t('shareHelper2')}
                    </Line>
                </Column>
            </Columns>
            {isExtension() && (
                <LanguageLine>🌎 {i18n.t('changeLanguage')}</LanguageLine>
            )}
            <ThemeLine>🎨 {i18n.t('themeHelper')}</ThemeLine>
            {isExtension() && (
                <WebsocketLine>🔴 {i18n.t('webSocketHelper')}</WebsocketLine>
            )}
        </Section>
    );
};

const fruitChoices = [
    '🍇',
    '🫐',
    '🍓',
    '🍌',
    '🥝',
    '🍈',
    '🍉',
    '🍊',
    '🍋',
    '🍍',
    '🥭',
    '🍎',
    '🍏',
    '🍑',
    '🍐',
    '🍒',
    '🥥'
] as const;
const timeout = 2000;
const maxFruit = 10;

const FruitSalad = () => {
    const [fruit, setFruit] = React.useState<
        Array<(typeof fruitChoices)[number]>
    >([]);
    const directionRef = React.useRef(1);
    const changeFruit = React.useCallback(
        (e: React.MouseEvent<HTMLSpanElement>) => {
            const fruitIndex = e.currentTarget.getAttribute('data-index');
            if (fruitIndex) {
                setFruit((f) =>
                    f.map((cf, i) =>
                        i === Number(fruitIndex) ? getFruit() : cf
                    )
                );
            }
        },
        []
    );
    React.useEffect(() => {
        const i = setInterval(() => {
            setFruit((f) => {
                if (
                    (directionRef.current > 0 && f.length === maxFruit) ||
                    (directionRef.current < 0 && f.length === 0)
                ) {
                    directionRef.current *= -1;
                }

                if (directionRef.current < 0) {
                    return f.slice(0, f.length - 1);
                } else {
                    return [...f, getFruit()];
                }
            });
        }, timeout);

        return () => clearInterval(i);
    }, []);
    return (
        <section>
            {fruit.map((f, i) => (
                <Fruit
                    key={i}
                    fruit={f}
                    isLast={i === fruit.length - 1}
                    index={i}
                    onClick={changeFruit}
                />
            ))}
        </section>
    );
};

const Fruit = ({
    fruit,
    isLast,
    index,
    onClick
}: {
    index: number;
    fruit: (typeof fruitChoices)[number];
    isLast: boolean;
    onClick: (e: React.MouseEvent<HTMLSpanElement>) => void;
}) => (
    <span
        data-index={index}
        style={{
            position: 'fixed',
            top: Math.random() * window.innerHeight,
            left: Math.random() * window.innerWidth,
            transform: `rotate(${Math.random() * 360}deg)`,
            fontSize: isLast ? 0 : Math.max(Math.random() * 100),
            transition: `all ${timeout}ms`,
            cursor: 'pointer',
            userSelect: 'none'
        }}
        onClick={onClick}>
        {fruit}
    </span>
);

function getFruit() {
    return fruitChoices[Math.floor(Math.random() * fruitChoices.length)];
}
