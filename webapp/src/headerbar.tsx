/// <reference path="../../built/pxtlib.d.ts" />

import * as React from "react";
import * as data from "./data";
import * as sui from "./sui";

import * as auth from "./auth";
import * as cmds from "./cmds"
import * as container from "./container";
import * as identity from "./identity";
import * as pkg from "./package";
import * as projects from "./projects";
import * as tutorial from "./tutorial";
import * as simulator from "./simulator";

type ISettingsProps = pxt.editor.ISettingsProps;
type HeaderBarView = "home" | "editor" | "tutorial" | "tutorial-tab" | "debugging" | "sandbox";
const LONGPRESS_DURATION = 750;
//// SAMLABS  console button listener
export class HeaderBar extends data.Component<ISettingsProps, {isFlashInProgress:boolean;isFlashing:boolean; flashCount:number; showConsole:boolean;}> {
    protected longpressTimer: any;
    protected touchStartTime: number;
    private flashTimeout: number | null = null;

    constructor(props: ISettingsProps) {
        super(props);

        this.state = {
            isFlashInProgress: false,
            isFlashing: false,
            flashCount: 0,
            showConsole: false
        };
        window.addEventListener("message", this.handleConsoleFlash);
    }

    componentWillUnmount() {
        window.removeEventListener("message", this.handleConsoleFlash);
        if (this.flashTimeout) {
            clearTimeout(this.flashTimeout);
        }
    }

    handleConsoleFlash = (event: MessageEvent) => {
        if(this.state.isFlashInProgress) return;
        if (event.data.type === `CONSOLE_BUTTON_FLASH_ON`) {
            if (!this.state.showConsole) {
                    this.setState({ isFlashing: true, flashCount: 0 }, this.flashSequence);
            }
        }
    };

    flashSequence = () => {
        this.setState({isFlashInProgress: true});
        if (this.state.flashCount < 3) {
            this.flashTimeout = setTimeout(() => {
                this.setState(
                    prevState => ({
                        isFlashing: !prevState.isFlashing,
                        flashCount: prevState.flashCount + 1
                    }),
                    this.flashSequence
                );
            }, 333);
        } else {
            this.setState({ isFlashing: false, flashCount: 0, isFlashInProgress: false});
        }
    };

    //// SAMLABS end console button listener


    goHome = () => {
        pxt.tickEvent("menu.home", undefined, { interactiveConsent: true });
        if (this.getView() !== "home") this.props.parent.showExitAndSaveDialog();
    }

    showShareDialog = () => {
        pxt.tickEvent("menu.share", undefined, { interactiveConsent: true });
        this.props.parent.showShareDialog();
    }

    launchFullEditor = () => {
        pxt.tickEvent("sandbox.openfulleditor", undefined, { interactiveConsent: true });
        this.props.parent.launchFullEditor();
    }

    exitTutorial = () => {
        const tutorialOptions = this.props.parent.state.tutorialOptions;
        pxt.tickEvent("menu.exitTutorial", { tutorial: tutorialOptions?.tutorial }, { interactiveConsent: true });
        this.props.parent.exitTutorial();
    }

    showReportAbuse = () => {
        pxt.tickEvent("tutorial.reportabuse", undefined, { interactiveConsent: true });
        this.props.parent.showReportAbuse();
    }

    toggleDebug = () => {
        // This function will get called when the user clicks the "Exit Debug Mode" button in the menu bar.
        pxt.tickEvent("simulator.debug", undefined, { interactiveConsent: true });
        this.props.parent.toggleDebugging();
    }

    brandIconClick = () => {
        pxt.tickEvent("projects.brand", undefined, { interactiveConsent: true });
        this.goHome();
    }

    backButtonTouchStart = (evt: any) => {
        this.longpressTimer = setTimeout(() => cmds.nativeHostLongpressAsync(), LONGPRESS_DURATION);
        this.touchStartTime = new Date().getTime();
    }

    backButtonTouchEnd = (evt: any) => {
        evt.preventDefault();
        if (this.touchStartTime && (new Date().getTime() - this.touchStartTime) < LONGPRESS_DURATION) {
            cmds.nativeHostBackAsync();
        }
        this.touchStartTime = null;
        clearTimeout(this.longpressTimer);
    }

    onPlayWithFriendsClick = (evt: any) => {
        evt.preventDefault();
        pxt.tickEvent("menu.playwithfriends", undefined, { interactiveConsent: true });
        window.open(pxt.multiplayer.SHORT_LINK(), "_blank");
    }

    protected getView = (): HeaderBarView => {
        const { home, debugging, tutorialOptions } = this.props.parent.state;
        if (home) {
            return "home";
        } else if (pxt.shell.isSandboxMode()) {
            return "sandbox";
        } else if (debugging) {
            return "debugging";
        } else if (!pxt.BrowserUtils.useOldTutorialLayout() && !!tutorialOptions?.tutorial) {
            return "tutorial-tab";
        } else if (!!tutorialOptions?.tutorial) {
            return "tutorial";
        } else {
            return "editor";
        }
    }

    getOrganizationLogo(targetTheme: pxt.AppTheme, highContrast?: boolean, view?: string) {
        return <div className="ui item logo organization">
            {targetTheme.organizationWideLogo || targetTheme.organizationLogo
                ? <img className={`ui logo ${view !== "home" ? "mobile hide" : ""}`} src={targetTheme.organizationWideLogo || targetTheme.organizationLogo} alt={lf("{0} Logo", targetTheme.organization)} />
                : <span className="name">{targetTheme.organization}</span>}
            {targetTheme.organizationLogo && view !== "home" && (<img className={`ui image mobile only`} src={targetTheme.organizationLogo} alt={lf("{0} Logo", targetTheme.organization)} />)}
        </div>
    }

    getTargetLogo(targetTheme: pxt.AppTheme, highContrast?: boolean, view?: string) {
        // TODO: "sandbox" view components are temporary share page layout
        return <div aria-label={lf("{0} Logo", targetTheme.boardName)} role="menuitem" className={`ui item logo brand ${view !== "sandbox" && view !== "home" ? "mobile hide" : ""}`} onClick={this.brandIconClick}>
            {targetTheme.useTextLogo
            ? [ <span className="name" key="org-name">{targetTheme.organizationText}</span>,
                <span className="name-short" key="org-name-short">{targetTheme.organizationShortText || targetTheme.organizationText}</span> ]
            : (targetTheme.logo || targetTheme.portraitLogo
                ? <img className={`ui ${targetTheme.logoWide ? "small" : ""} logo`} src={targetTheme.logo || targetTheme.portraitLogo} alt={lf("{0} Logo", targetTheme.boardName)} />
                : <span className="name">{targetTheme.boardName}</span>)}
        </div>
    }

    getCenterLabel(targetTheme: pxt.AppTheme, view: HeaderBarView, tutorialOptions?: pxt.tutorial.TutorialOptions) {
        const showAssets = !!pkg.mainEditorPkg().files[pxt.ASSETS_FILE];
        const languageRestriction = pkg.mainPkg?.config?.languageRestriction;
        // If there is only one editor (eg Py only, no assets), we display a label instead of a toggle
        const hideToggle = !showAssets && (languageRestriction === pxt.editor.LanguageRestriction.JavaScriptOnly
            || languageRestriction === pxt.editor.LanguageRestriction.PythonOnly) || targetTheme.blocksOnly;

        switch (view) {
            case "tutorial":
                const activityName = tutorialOptions?.tutorialActivityInfo ?
                    tutorialOptions.tutorialActivityInfo[tutorialOptions.tutorialStepInfo[tutorialOptions.tutorialStep].activity].name :
                    null;
                const hideIteration = tutorialOptions?.metadata?.hideIteration;

                if (activityName) return <div className="ui item">{activityName}</div>
                if (!hideIteration) return <tutorial.TutorialMenu parent={this.props.parent} />
                break;
            case "tutorial-tab":
                if (tutorialOptions && (pxt.appTarget?.appTheme?.tutorialSimSidebarLayout || pxt.BrowserUtils.isTabletSize())) {
                    const currentStep = tutorialOptions.tutorialStep ? tutorialOptions.tutorialStep + 1 : undefined;
                    const totalSteps = tutorialOptions.tutorialStepInfo ? tutorialOptions.tutorialStepInfo?.length : undefined;
                    return (
                        <div className="tutorial-header-label">
                            <div className="ui item tutorial-header-name-label">{tutorialOptions.tutorialName}</div>
                            {currentStep && totalSteps && (
                                <>
                                    <div className="ui item tutorial-header-step-label">{" - "}</div> { /* Keeping this separate helps simplify spacing */ }
                                    <div className="ui item tutorial-header-step-label">{lf("Step {0} of {1}", currentStep, totalSteps, totalSteps)}</div>
                                </>
                            )}
                        </div>
                    );
                }
                return <div />;
            case "debugging":
                return  <sui.MenuItem className="centered" icon="large bug" name="Debug Mode" />
            case "sandbox":
            case "editor":
                if (hideToggle) {
                    // Label for single language
                    switch (languageRestriction) {
                        case pxt.editor.LanguageRestriction.PythonOnly:
                            return <sui.MenuItem className="centered" icon="xicon python" name="Python" />
                        case pxt.editor.LanguageRestriction.JavaScriptOnly:
                            return <sui.MenuItem className="centered" icon="xicon js" name="JavaScript" />
                        default:
                            break;
                    }
                } else {
                    return <div className="ui item link editor-menuitem">
                        <container.EditorSelector parent={this.props.parent} sandbox={view === "sandbox"} python={targetTheme.python} languageRestriction={languageRestriction} headless={pxt.appTarget.simulator?.headless} />
                    </div>
                }
        }

        return <div />;
    }

    getExitButtons(targetTheme: pxt.AppTheme, view: HeaderBarView, tutorialOptions?: pxt.tutorial.TutorialOptions) {
        switch (view) {
            case "debugging":
                return <sui.ButtonMenuItem className="exit-debugmode-btn" role="menuitem" icon="external" text={lf("Exit Debug Mode")} textClass="landscape only" onClick={this.toggleDebug} />
            case "sandbox":
                if (!targetTheme.hideEmbedEdit) return <sui.Item role="menuitem" icon="external" textClass="mobile hide" text={lf("Edit")} onClick={this.launchFullEditor} />
                break;
            case "tutorial":
            case "tutorial-tab":
                const tutorialButtons = [];
                if (tutorialOptions?.tutorialReportId) {
                    const reportTutorialLabel = lf("Unapproved Content");
                    tutorialButtons.push(<sui.Item key="tutorial-report" role="menuitem" icon="exclamation triangle"
                        className="report-tutorial-btn link-button icon-and-text" textClass="landscape only"
                        text={reportTutorialLabel} ariaLabel={reportTutorialLabel} onClick={this.showReportAbuse} />);
                }
                if (!targetTheme.lockedEditor && !tutorialOptions?.metadata?.hideIteration && (view !== "tutorial-tab" || pxt.appTarget.simulator?.headless)) {
                    const exitTutorialLabel = lf("Exit tutorial");
                    tutorialButtons.push(<sui.Item key="tutorial-exit" role="menuitem" icon="sign out large"
                        className="exit-tutorial-btn link-button icon-and-text" textClass="landscape only"
                        text={exitTutorialLabel} ariaLabel={exitTutorialLabel} onClick={this.exitTutorial} />);
                }

                if (!!tutorialButtons.length) return tutorialButtons;
                break;
        }

        return <div />
    }

    // TODO: eventually unify these components into one menu
    getSettingsMenu = (view: HeaderBarView) => {
        const { greenScreen, accessibleBlocks, header } = this.props.parent.state;
        switch (view){
            case "home":
                return <projects.ProjectSettingsMenu parent={this.props.parent} />
            case "tutorial-tab":
            case "editor":
                return <container.SettingsMenu parent={this.props.parent} greenScreen={greenScreen} accessibleBlocks={accessibleBlocks} showShare={!!header} />
            default:
                return <div />
        }
    }



    getConsoleButton = (showConsole: boolean) => {
        const { isFlashing } = this.state;
        return (
            <div style={{
                display: 'flex',
                flexDirection: "column",
                padding: 4,
                width: 60,
                borderRadius: 4,
                backgroundColor: isFlashing ? '#fff' : '#26d0c4'
            }}>
                {showConsole? (
                    <svg style={{padding: 4, margin: 'auto', fill: '#fff', width: 31, height: 32}} viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0)">
                            <path
                                d="M23.575 8.673H24.539C24.7947 8.673 25.0399 8.57143 25.2207 8.39065C25.4014 8.20986 25.503 7.96467 25.503 7.709V6.745C25.503 6.48933 25.4014 6.24413 25.2207 6.06335C25.0399 5.88256 24.7947 5.781 24.539 5.781H23.575C23.3193 5.781 23.0741 5.88256 22.8934 6.06335C22.7126 6.24413 22.611 6.48933 22.611 6.745V7.709C22.611 7.96467 22.7126 8.20986 22.8934 8.39065C23.0741 8.57143 23.3193 8.673 23.575 8.673ZM23.575 13.491H24.539C24.7947 13.491 25.0399 13.3894 25.2207 13.2086C25.4014 13.0279 25.503 12.7827 25.503 12.527V11.563C25.503 11.3073 25.4014 11.0621 25.2207 10.8813C25.0399 10.7006 24.7947 10.599 24.539 10.599H23.575C23.3193 10.599 23.0741 10.7006 22.8934 10.8813C22.7126 11.0621 22.611 11.3073 22.611 11.563V12.527C22.611 12.7827 22.7126 13.0279 22.8934 13.2086C23.0741 13.3894 23.3193 13.491 23.575 13.491ZM28.875 1.927H20.202V0.962997C20.2017 0.707502 20.1001 0.462567 19.9193 0.281998C19.7385 0.101429 19.4935 0 19.238 0H3.855C2.83259 0 1.85206 0.406152 1.1291 1.1291C0.40615 1.85206 0 2.83259 0 3.855V15.419C0 15.9252 0.0997127 16.4265 0.293445 16.8942C0.487177 17.362 0.771133 17.7869 1.1291 18.1449C1.48707 18.5029 1.91204 18.7868 2.37976 18.9806C2.84747 19.1743 3.34875 19.274 3.855 19.274H19.238C19.4937 19.274 19.7389 19.1724 19.9197 18.9917C20.1004 18.8109 20.202 18.5657 20.202 18.31V17.346H28.875C29.1307 17.346 29.3759 17.2444 29.5567 17.0637C29.7374 16.8829 29.839 16.6377 29.839 16.382V2.891C29.839 2.63533 29.7374 2.39014 29.5567 2.20935C29.3759 2.02857 29.1307 1.927 28.875 1.927ZM18.275 17.346H3.855C3.34393 17.346 2.85379 17.143 2.4924 16.7816C2.13102 16.4202 1.928 15.9301 1.928 15.419V3.855C1.928 3.34393 2.13102 2.85379 2.4924 2.49241C2.85379 2.13103 3.34393 1.928 3.855 1.928H18.275V17.346ZM27.912 15.419H20.202V3.855H27.908L27.912 15.419Z"
                                fill={'#fff'}/>
                            <path
                                d="M23.575 8.673H24.539C24.7947 8.673 25.0399 8.57143 25.2207 8.39065C25.4014 8.20986 25.503 7.96467 25.503 7.709V6.745C25.503 6.48933 25.4014 6.24413 25.2207 6.06335C25.0399 5.88256 24.7947 5.781 24.539 5.781H23.575C23.3193 5.781 23.0741 5.88256 22.8934 6.06335C22.7126 6.24413 22.611 6.48933 22.611 6.745V7.709C22.611 7.96467 22.7126 8.20986 22.8934 8.39065C23.0741 8.57143 23.3193 8.673 23.575 8.673ZM23.575 13.491H24.539C24.7947 13.491 25.0399 13.3894 25.2207 13.2086C25.4014 13.0279 25.503 12.7827 25.503 12.527V11.563C25.503 11.3073 25.4014 11.0621 25.2207 10.8813C25.0399 10.7006 24.7947 10.599 24.539 10.599H23.575C23.3193 10.599 23.0741 10.7006 22.8934 10.8813C22.7126 11.0621 22.611 11.3073 22.611 11.563V12.527C22.611 12.7827 22.7126 13.0279 22.8934 13.2086C23.0741 13.3894 23.3193 13.491 23.575 13.491ZM28.875 1.927H20.202V0.962997C20.2017 0.707502 20.1001 0.462567 19.9193 0.281998C19.7385 0.101429 19.4935 0 19.238 0H3.855C2.83259 0 1.85206 0.406152 1.1291 1.1291C0.40615 1.85206 0 2.83259 0 3.855V15.419C0 15.9252 0.0997127 16.4265 0.293445 16.8942C0.487177 17.362 0.771133 17.7869 1.1291 18.1449C1.48707 18.5029 1.91204 18.7868 2.37976 18.9806C2.84747 19.1743 3.34875 19.274 3.855 19.274H19.238C19.4937 19.274 19.7389 19.1724 19.9197 18.9917C20.1004 18.8109 20.202 18.5657 20.202 18.31V17.346H28.875C29.1307 17.346 29.3759 17.2444 29.5567 17.0637C29.7374 16.8829 29.839 16.6377 29.839 16.382V2.891C29.839 2.63533 29.7374 2.39014 29.5567 2.20935C29.3759 2.02857 29.1307 1.927 28.875 1.927ZM18.275 17.346H3.855C3.34393 17.346 2.85379 17.143 2.4924 16.7816C2.13102 16.4202 1.928 15.9301 1.928 15.419V3.855C1.928 3.34393 2.13102 2.85379 2.4924 2.49241C2.85379 2.13103 3.34393 1.928 3.855 1.928H18.275V17.346ZM27.912 15.419H20.202V3.855H27.908L27.912 15.419Z"
                                fill={'#fff'}/>
                        </g>
                        <defs>
                            <clipPath id="clip0">
                                <rect width="29.838" height="19.273" fill={'#fff'}/>
                            </clipPath>
                        </defs>
                    </svg>)
                    :
                    ( <svg style={{padding: 4, margin: 'auto', fill: '#fff', width: 31, height: 32}} viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                        <path style={{stroke: isFlashing ? '#26d0c4' :  'unset'}}
                              d="M4.11914 6.09015C3.724 6.47601 3.71643 7.10913 4.10229 7.50427L7.47876 10.9616L4.04126 14.3909C3.65027 14.7809 3.64941 15.4141 4.03955 15.8051L4.18726 15.9531C4.57727 16.3441 5.21045 16.3448 5.60144 15.9548L9.79395 11.7723C9.85828 11.7081 9.91211 11.6373 9.95532 11.5621C10.2584 11.1736 10.2354 10.6114 9.88159 10.2491L5.68835 5.95538C5.30249 5.56024 4.66943 5.55273 4.27429 5.9386L4.11914 6.09015Z"/>
                        <path style={{stroke: isFlashing ? '#26d0c4' : 'unset'}}
                              d="M18.3438 15.1958C18.3438 14.6435 17.896 14.1958 17.3438 14.1958H10.7213C10.1691 14.1958 9.72131 14.6435 9.72131 15.1958V15.4049C9.72131 15.9572 10.1691 16.4049 10.7213 16.4049H17.3438C17.896 16.4049 18.3438 15.9572 18.3438 15.4049V15.1958Z"/>
                        <path fillRule="evenodd" clipRule="evenodd"
                              style={{stroke: isFlashing ? '#26d0c4' : 'unset'}}
                              d="M0 2C0 0.895447 0.895386 0 2 0H20C21.1046 0 22 0.895447 22 2V20C22 21.1046 21.1046 22 20 22H2C0.895386 22 0 21.1046 0 20V2ZM2 2H20V20H2V2Z"/>
                    </svg>)
                }
                <span style={{
                    padding: 2,
                    fontSize: 13,
                    color: isFlashing ? '#26d0c4' :  '#fff'
                }}>{showConsole ? 'Devices' : 'Console'}</span>
            </div>
        );
    }


    renderCore() {
        const targetTheme = pxt.appTarget.appTheme;
        const highContrast = this.getData<boolean>(auth.HIGHCONTRAST);
        const view = this.getView();

        const {home, header, tutorialOptions} = this.props.parent.state;
        const isController = pxt.shell.isControllerMode();
        const isNativeHost = cmds.isNativeHost();
        const hasIdentity = auth.hasIdentity();
        const activeEditor = this.props.parent.isPythonActive() ? "Python"
            : (this.props.parent.isJavaScriptActive() ? "JavaScript" : "Blocks");

        const showHomeButton = (view === "editor" || view === "tutorial-tab") && !targetTheme.lockedEditor && !isController;
        const showShareButton = (view === "editor" || view === "tutorial-tab") && header && pxt.appTarget.cloud?.sharing && !isController;
        const showHelpButton = view === "editor" && targetTheme.docMenu?.length;

        // Approximate each tutorial step to be 22 px
        const manyTutorialSteps = view == "tutorial" && (tutorialOptions.tutorialStepInfo.length * 22 > window.innerWidth / 3);

        return <div id="mainmenu"
                    className={`ui borderless fixed menu ${targetTheme.invertedMenu ? `inverted` : ''} ${manyTutorialSteps ? "thin" : ""}`}
                    role="menubar">
            <div className="left menu">
                {/*///// SAMLABS back button*/}
                {home && <sui.Item className={`icon`} role="menuitem" title={lf("Back to SAMStudio")}
                                   icon="no-select chevron left large" ariaLabel={lf("Back to SAMStudio")}
                                   onClick={() => {
                                       window.location.href = 'https://studio.samlabs.com/'
                                   }}/>}
                {!home && <sui.Item  className={`icon`} role="menuitem" title={lf("Console")} ariaLabel={lf("Console")}
                                    onClick={() => {
                                        this.setState({showConsole: !this.state.showConsole, isFlashInProgress: false});
                                        simulator.driver.samMessageToTarget({
                                            type: `CONSOLE_CALLED`,
                                            value: !this.state.showConsole
                                        });
                                    }}>
                    {this.getConsoleButton(this.state.showConsole)}
                </sui.Item>}
                {!home && this.state.showConsole &&
                    <sui.Item className={`icon`} role="menuitem" title={lf("Clear Console")}
                              ariaLabel={lf("Clear Console button")}
                              icon={'ban small'}
                              onClick={() => {
                                  simulator.driver.samMessageToTarget({
                                      type: `CLEAR_CONSOLE_CALLED`
                                  });
                              }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: "column",
                            width: 100,
                            borderRadius: 4,
                            backgroundColor:'#26d0c4'
                        }}>
                            <span style={{
                                padding: 2,
                                marginLeft: 2,
                                fontSize: 14,
                                color: '#fff',
                                textAlign: 'center'
                            }}>Clear Console</span>
                        </div>
                    </sui.Item>}
                {/*///// SAMLABS end back button*/}
                {isNativeHost && <sui.Item className="icon nativeback" role="menuitem" icon="chevron left large" ariaLabel={lf("Back to application")}
                    onClick={cmds.nativeHostBackAsync} onMouseDown={this.backButtonTouchStart} onMouseUp={this.backButtonTouchEnd} onMouseLeave={this.backButtonTouchEnd} />}
                {this.getOrganizationLogo(targetTheme, highContrast, view)}
                {/*{view === "tutorial"*/}
                {/*    // TODO: temporary place for tutorial name, we will eventually redesign the header for tutorial view*/}
                {/*    ? <sui.Item className="tutorialname" tabIndex={-1} textClass="landscape only" text={tutorialOptions.tutorialName}/>*/}
                {/*    : this.getTargetLogo(targetTheme, highContrast, view)}*/}
            </div>
            {!home && <div className="center menu">
                {this.getCenterLabel(targetTheme, view, tutorialOptions)}
            </div>}
            <div className="right menu">
                {this.getExitButtons(targetTheme, view, tutorialOptions)}
                {showHomeButton && <sui.Item className={`icon openproject ${hasIdentity ? "mobile hide" : ""}`} role="menuitem" title={lf("Home")} icon="home large" ariaLabel={lf("Home screen")} onClick={this.goHome} />}
                {showShareButton && <sui.Item className="icon shareproject mobile hide" role="menuitem" title={lf("Publish your game to create a shareable link")} icon="share alternate large" ariaLabel={lf("Share Project")} onClick={this.showShareDialog} />}
                {/*{showHelpButton && <container.DocsMenu parent={this.props.parent} editor={activeEditor} />}*/}
                {this.getSettingsMenu(view)}
                {hasIdentity && (view === "home" || view === "editor" || view === "tutorial-tab") && <identity.UserMenu parent={this.props.parent} />}
            </div>
        </div>
    }
}