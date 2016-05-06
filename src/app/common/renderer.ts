/*
 * Copyright (C) Martin Schade, 2015-2016. All rights reserved.
 */

import {ViewGroup, ViewItem, ViewVertex} from "./viewmodel";
import {ICameraObserver, Camera} from "./camera";

/**
 * A view model renderer.
 *
 * @author Martin Schade.
 * @since 1.0.0
 */
export interface IViewModelRenderer<I, G> {

    /**
     * Render a view item.
     */
    renderItem(item: ViewItem): I;

    /**
     * Render a view group.
     */
    renderGroup(group: ViewGroup, topLevel: boolean): G;

    /**
     * 
     */
    renderTree(group: ViewGroup): G;

    /**
     *
     */
    attach(node: ViewVertex, group: ViewGroup)
}

/**
 * Provides access to the low level rendering scene graph.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export interface IVisualRenderer<E, G> {

    /**
     * Create a text shape.
     */
    text(text: string, x: number, y: number): E;

    /**
     * Create a rectangular shape.
     */
    rectangle(x: number, y: number, width: number, height: number): E;

    /**
     * Create a rounded rectangular shape.
     */
    rounded(x: number, y: number, width: number, height: number, radius: number): E;

    /**
     * Create a circular shape.
     */
    circle(x: number, y: number, r: number): E;

    /**
     * Create a low-level grouping object.
     */
    group(): G;

    /**
     * Translate a primitive.
     */
    translate(obj: E, x: number, y: number);

    /**
     * Scale a primitive.
     */
    scale(obj: E, scale: number);

    /**
     * Rotate a primitive.
     */
    rotate(obj: E, angle: number);

    /**
     * 
     */
    fill(obj: E, fill: string);

    /**
     *
     */
    stroke(obj: E, stroke: string, width: number);
}

/**
 * Is responsible for handling the platform dependent methods.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface IPlatformLayer extends ICameraObserver {
    getCamera(): Camera;
    setModel(model: ViewGroup)
}
