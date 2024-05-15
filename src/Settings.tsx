import React, { ChangeEvent, useEffect, useState } from "react";
import {
  GitHubCustomLabelFetcher,
  setNestedProperty,
} from "./api/address-resolver/CustomLabelResolver";
import ContentFrame from "./components/ContentFrame";
import StandardFrame from "./components/StandardFrame";
import StandardSubtitle from "./components/StandardSubtitle";
import { usePageTitle } from "./useTitle";

async function saveSetting(e: ChangeEvent<HTMLInputElement>): Promise<void> {
  const settingName = e.target.getAttribute("data-setting-name");
  if (settingName === null) {
    throw new Error("Setting requires data-setting-name to be set");
  }
  const settingsObj = await JSON.parse(
    localStorage.getItem("settings") || "{}",
  );
  setNestedProperty(settingsObj, settingName, e.target.value);
  await localStorage.setItem("settings", JSON.stringify(settingsObj));
  // Synchronize label fetcher state without requiring a reload
  if (settingName.startsWith("github-address-labels.")) {
    await GitHubCustomLabelFetcher.getInstance().loadSettings();
  }
}

type SettingsType = {
  "github-address-labels"?: {
    username?: string;
    "repo-name"?: string;
    token?: string;
  };
};

const Settings: React.FC = () => {
  usePageTitle("Settings");

  const [settingsState, setSettingsState] = useState<SettingsType>({});

  useEffect(() => {
    (async function () {
      const settingsObj = JSON.parse(
        (await localStorage.getItem("settings")) || "{}",
      );
      setSettingsState(settingsObj);
    })();
  }, []);

  return (
    <StandardFrame>
      <StandardSubtitle>Settings</StandardSubtitle>
      <ContentFrame>
        <div className="p-4">
          <h3 className="mb-4">GitHub Address Labels</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              GitHub Username
              <input
                data-setting-name="github-address-labels.username"
                type="text"
                onChange={saveSetting}
                className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white"
                defaultValue={
                  settingsState?.["github-address-labels"]?.["username"] ?? ""
                }
              />
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Repository Name
              <input
                data-setting-name="github-address-labels.repo-name"
                type="text"
                onChange={saveSetting}
                className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white"
                defaultValue={
                  settingsState?.["github-address-labels"]?.["repo-name"] ?? ""
                }
              />
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              GitHub API Token
              <input
                data-setting-name="github-address-labels.token"
                type="text"
                onChange={saveSetting}
                className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white"
                defaultValue={
                  settingsState?.["github-address-labels"]?.["token"] ?? ""
                }
              />
            </label>
          </div>
        </div>
      </ContentFrame>
    </StandardFrame>
  );
};

export default Settings;
