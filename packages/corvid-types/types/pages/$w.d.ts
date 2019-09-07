type ComponentSelectorByType = {
  "Button": $w.Button;
  "Image": $w.Image;
  "Anchor": $w.Anchor;
  "DatePicker": $w.DatePicker;
}

declare function $w<T extends keyof PageElementsMap>(selector: T): PageElementsMap[T]
declare function $w<T extends keyof ComponentSelectorByType>(selector: T): ComponentSelectorByType[T]

/**
 * The `$w` namespace contains everything you need in order to work
 *  with your site's components. It contains all of the UI elements, nodes, and
 *  events that make up your site. It also includes the [`$w()`]($w.html#w),
 *  [`onReady()`]($w.html#onReady), and [`at()`]($w.html#at) functions.
 *
 *  The APIs in `$w` can only be used in front-end code.
 *
 *  You do not need to import `$w`.
 */
declare namespace $w {
  /**
   * Gets a selector function for a specific context.
   */
  export function at(context: $w.Event.EventContext): $w.$w;

  /**
   * Sets the function that runs when all the page elements have finished loading.
   */
  export function onReady(initFunction: $w.ReadyHandler): void;

}