'use strict';

import { Set } from 'immutable';
import React, { PropTypes } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    Text,
    Platform,
    Dimensions,
    ScrollView,
} from 'react-native';


import GridNavigatorItem from './GridNavigatorItem';

export default class GridNavigator extends React.Component {

    static propTypes = {
        ...View.propTypes,
        sceneStyle: View.propTypes.style,
        tabBarStyle: View.propTypes.style,
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            renderedSceneKeys: this._updateRenderedSceneKeys(props.children),
        };

        this._renderTab = this._renderTab.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        console.log('tag','componentWillReceiveProps');
        let { renderedSceneKeys } = this.state;
        this.setState({
            renderedSceneKeys: this._updateRenderedSceneKeys(
                nextProps.children,
                renderedSceneKeys,
            ),
        });
    }

    _getSceneKey(item, index): string {
        return `scene-${(item.key !== null) ? item.key : index}`;
    }

    _updateRenderedSceneKeys(children, oldSceneKeys = Set()): Set {
        let newSceneKeys = Set().asMutable();
        React.Children.forEach(children, (item, index) => {
            let key = this._getSceneKey(item, index);
            if (oldSceneKeys.has(key) || item.props.selected) {
                newSceneKeys.add(key);
            }
        });
        return newSceneKeys.asImmutable();
    }

    render() {
        console.log('tag','render');
        let { style, children, tabBarStyle, sceneStyle, ...props } = this.props;
        let scenes = [];
        React.Children.forEach(children, (item, index) => {
            let sceneKey = this._getSceneKey(item, index);
            if (!this.state.renderedSceneKeys.has(sceneKey)) {
                return;
            }
            let { selected } = item.props;
            let scene =
                <SceneContainer key={sceneKey} selected={selected} style={sceneStyle}>
                    {item}
                </SceneContainer>;
            scenes.push(scene);
        });

        return (
            <View {...props} style={[styles.container, style]}>
                {scenes}
                <View style={[styles.tabContainer,tabBarStyle]}>
                    <ScrollView style={{height:Platform.OS === 'ios' ?
                    Dimensions.get('window').height-120 : Dimensions.get('screen').height-180}}>
                        {React.Children.map(children, this._renderTab)}
                    </ScrollView>
                </View>
            </View>

        );
    }

    _renderTab(item) {
        return (
            <TouchableOpacity activeOpacity={0.7} onPress={item.props.onPress}>
                <View style={[styles.itemContainer,item.props.selected?item.props.selectedBacStyle:null]}>
                    <Text numberOfLines={1} style={[styles.showText,item.props.selected?styles.selectText:null]}>{item.props.title}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}
/**
 * 控制透明度，所以每次都尽心render
 */
class SceneContainer extends React.Component {
    static propTypes = {
        ...View.propTypes,
        selected: PropTypes.bool,
    };

    render() {
        /**
         * 通过选中和未选中来实现当前容器的显示和不显示
         */
        let { selected, ...props } = this.props;
        return (
            <View
                {...props}
                pointerEvents={selected ? 'auto' : 'none'}
                removeClippedSubviews={!selected}
                style={[
          styles.sceneContainer,
          selected ? null : styles.hiddenSceneContainer,
          props.style,
        ]}>
                <StaticContainer shouldUpdate={selected}>
                    {this.props.children}
                </StaticContainer>
            </View>
        );
    }
}
/**
 * 做为真正的内容载体，可以根据shouldComponentUpdate来决定是否渲染以及缓存
 */
class StaticContainer extends React.Component {
    static propTypes = {
        shouldUpdate: PropTypes.bool,
    };

    shouldComponentUpdate(nextProps: Object): boolean {
        return false;
    }

    render() {
        let { children } = this.props;
        return children ? React.Children.only(children) : null;
    }
}


let styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sceneContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    hiddenSceneContainer: {
        overflow: 'hidden',
        opacity: 0,
    },
    defaultSelectedTitle: {
        color: 'rgb(0, 122, 255)',
    },
    defaultSelectedIcon: {
        tintColor: 'rgb(0, 122, 255)',
    },
    itemContainer:{
        alignItems:'center',
        paddingTop:Platform.OS === 'ios'?18:12,
        paddingBottom:Platform.OS === 'ios'?18:12,
        justifyContent:'center',
        borderRightWidth:0.5,
        borderBottomWidth:0.5,
        borderColor:'#F0F0F0',
        backgroundColor:'#ffff',
    },
    showText: {
        fontSize: 14,
        color:'rgb(92, 92, 92)',
    },
    selectText:{
        fontSize: 14,
        color:'rgb(255,0,0)',
    },
    tabContainer: {
        backgroundColor: '#f8f8f8',
        width: 90,
        flex:1,
        position: 'absolute',
    },
});

GridNavigator.Item = GridNavigatorItem;
