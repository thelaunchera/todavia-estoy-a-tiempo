/**
 * A second stationary tap on the same layer reveals its delete handle.
 * Position and time checks prevent drags, pinch gestures and layer changes
 * from accidentally exposing a destructive control.
 */
export type LayerTap={id:number;at:number;x:number;y:number};
export const isLayerDoubleTap=(first:LayerTap|null,second:LayerTap):boolean=>
 Boolean(first&&first.id===second.id&&second.at>=first.at&&
 second.at-first.at<=420&&Math.hypot(second.x-first.x,second.y-first.y)<=36);

export const isStationaryTap=(start:{x:number;y:number}|null,now:{x:number;y:number}):boolean=>
 Boolean(start&&Math.hypot(now.x-start.x,now.y-start.y)<=14);
