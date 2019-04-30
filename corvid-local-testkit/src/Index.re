type siteItems;
type server;
type siteCreators;
type localSiteBuilder;

type localSite = string;

[@bs.module "corvid-local-server/src/testkit"]
external exStartInEditMode: localSite => server = "startInEditMode";
[@bs.module "corvid-local-server/src/testkit"]
external exStartInCloneMode: localSite => server = "startInCloneMode";

[@bs.module "corvid-local-site/testkit"]
external exLocalSiteBuilder: localSiteBuilder = "localSiteBuilder";

[@bs.module "corvid-local-test-utils"]
external initTempDir: siteItems => Js.Promise.t(localSite) = "";

[@bs.module "corvid-local-test-utils"]
external exSiteCreators: siteCreators = "siteCreators";

[@bs.deriving abstract]
type testkitServer = {
  startInEditMode: localSite => server,
  startInCloneMode: localSite => server,
};

[@bs.deriving abstract]
type testkit = {
  initSite: siteItems => Js.Promise.t(localSite),
  server: testkitServer,
  siteCreators,
  localSiteBuilder,
};

let createTestKit = () => {
  let initSite = siteItems => {
    initTempDir(siteItems)
    |> Js.Promise.then_(localSite => {
         Node.Fs.writeFileAsUtf8Sync(
           Node.Path.join2(localSite, ".corvidrc.json"),
           "",
         );
         Js.Promise.resolve(localSite);
       });
  };

  let server =
    testkitServer(
      ~startInEditMode=exStartInEditMode,
      ~startInCloneMode=exStartInCloneMode,
    );

  testkit(
    ~initSite,
    ~server,
    ~siteCreators=exSiteCreators,
    ~localSiteBuilder=exLocalSiteBuilder,
  );
};

let default = createTestKit;
