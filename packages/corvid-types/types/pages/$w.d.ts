type TypeNameToSdkType = {
  "AccountNavBar": $w.AccountNavBar;
  "Anchor": $w.Anchor;
  "AudioPlayer": $w.AudioPlayer;
  "Box": $w.Box;
  "Button": $w.Button;
  "Checkbox": $w.Checkbox;
  "CheckboxGroup": $w.CheckboxGroup;
  "Column": $w.Column;
  "ColumnStrip": $w.ColumnStrip;
  "Container": $w.Container;
  "DatePicker": $w.DatePicker;
  "Document": $w.Document;
  "Dropdown": $w.Dropdown;
  "Footer": $w.Footer;
  "Gallery": $w.Gallery;
  "GoogleMap": $w.GoogleMap;
  "Header": $w.Header;
  "HtmlComponent": $w.HtmlComponent;
  "IFrame": $w.IFrame;
  "Image": $w.Image;
  "MediaBox": $w.MediaBox;
  "MenuContainer": $w.MenuContainer;
  "Page": $w.Page;
  "Pagination": $w.Pagination;
  "ProgressBar": $w.ProgressBar;
  "QuickActionBar": $w.QuickActionBar;
  "RadioButtonGroup": $w.RadioButtonGroup;
  "RatingsDisplay": $w.RatingsDisplay;
  "RatingsInput": $w.RatingsInput;
  "Repeater": $w.Repeater;
  "RichTextBox": $w.RichTextBox;
  "Slide": $w.Slide;
  "Slider": $w.Slider;
  "Slideshow": $w.Slideshow;
  "Switch": $w.Switch;
  "Table": $w.Table;
  "Text": $w.Text;
  "TextBox": $w.TextBox;
  "TextInput": $w.TextInput;
  "TimePicker": $w.TimePicker;
  "UploadButton": $w.UploadButton;
  "VectorImage": $w.VectorImage;
  "VerticalMenu": $w.VerticalMenu;
  "Video": $w.Video;
  "VideoPlayer": $w.VideoPlayer;
}

type IntersectionArrayAndBase<T> = {
  [P in keyof T]: P extends "Document" ? T[P] : T[P] & [T[P]];
}

type ComponentSelectorByType = IntersectionArrayAndBase<TypeNameToSdkType>

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