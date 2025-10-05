// custom.d.ts
declare module "*.css" {
  // Bu, sadece CSS dosyalarını yan etki (side-effect) olarak import ettiğinizde yeterlidir.
  // Yani, CSS modülleri gibi bir obje beklemeyip sadece stilin yüklenmesini istediğinizde.
  const content: any;
  export default content;
}
