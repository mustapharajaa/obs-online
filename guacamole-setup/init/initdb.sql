/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

--
-- Create the database and user
--

--
-- The database schema for Apache Guacamole
--

--
-- Table of Guacamole users
--
CREATE TABLE guacamole_user (

  user_id         SERIAL       NOT NULL,
  username          VARCHAR(128) NOT NULL,
  password_hash     BYTEA        NOT NULL,
  password_salt     BYTEA,
  password_date     TIMESTAMP WITH TIME ZONE NOT NULL,

  disabled          BOOLEAN      NOT NULL DEFAULT FALSE,
  expired           BOOLEAN      NOT NULL DEFAULT FALSE,

  -- Profile information
  full_name         VARCHAR(256),
  email_address     VARCHAR(256),
  organization      VARCHAR(256),
  organizational_role VARCHAR(256),

  -- Timezone preference
  timezone          VARCHAR(64),

  -- Last (most recent) login
  last_active       TIMESTAMP WITH TIME ZONE,

  PRIMARY KEY (user_id),
  UNIQUE (username)

);

CREATE INDEX guacamole_user_username_index ON guacamole_user(username);
CREATE INDEX guacamole_user_disabled_index ON guacamole_user(disabled);
CREATE INDEX guacamole_user_expired_index ON guacamole_user(expired);
CREATE INDEX guacamole_user_last_active_index ON guacamole_user(last_active);

--
-- Table of Guacamole connections
--
CREATE TABLE guacamole_connection (

  connection_id   SERIAL       NOT NULL,
  connection_name VARCHAR(128) NOT NULL,
  parent_id       INTEGER,
  protocol        VARCHAR(32)  NOT NULL,
  proxy_port      INTEGER,
  proxy_hostname  VARCHAR(512),
  proxy_encryption_method VARCHAR(4),
  max_connections           INTEGER,
  max_connections_per_user  INTEGER,
  connection_weight         INTEGER,
  failover_only             BOOLEAN NOT NULL DEFAULT FALSE,

  PRIMARY KEY (connection_id),
  UNIQUE (connection_name, parent_id),

  FOREIGN KEY (parent_id) REFERENCES guacamole_connection_group (connection_group_id) ON DELETE CASCADE

);

CREATE INDEX guacamole_connection_parent_id_index ON guacamole_connection(parent_id);

--
-- Table of Guacamole connection groups
--
CREATE TABLE guacamole_connection_group (

  connection_group_id   SERIAL       NOT NULL,
  parent_id             INTEGER,
  connection_group_name VARCHAR(128) NOT NULL,
  type                  guacamole_connection_group_type NOT NULL DEFAULT 'ORGANIZATIONAL',

  -- Concurrency limits
  max_connections          INTEGER,
  max_connections_per_user INTEGER,
  enable_session_affinity  BOOLEAN NOT NULL DEFAULT FALSE,

  PRIMARY KEY (connection_group_id),
  UNIQUE (connection_group_name, parent_id),

  FOREIGN KEY (parent_id) REFERENCES guacamole_connection_group (connection_group_id) ON DELETE CASCADE

);

CREATE INDEX guacamole_connection_group_parent_id_index ON guacamole_connection_group(parent_id);

--
-- Table of Guacamole connection parameters
--
CREATE TABLE guacamole_connection_parameter (

  connection_id   INTEGER      NOT NULL,
  parameter_name  VARCHAR(128) NOT NULL,
  parameter_value VARCHAR(4096) NOT NULL,

  PRIMARY KEY (connection_id, parameter_name),
  FOREIGN KEY (connection_id) REFERENCES guacamole_connection (connection_id) ON DELETE CASCADE

);

--
-- Table of Guacamole sharing profiles
--
CREATE TABLE guacamole_sharing_profile (

  sharing_profile_id    SERIAL       NOT NULL,
  sharing_profile_name  VARCHAR(128) NOT NULL,
  primary_connection_id INTEGER      NOT NULL,

  PRIMARY KEY (sharing_profile_id),
  UNIQUE (sharing_profile_name, primary_connection_id),

  FOREIGN KEY (primary_connection_id) REFERENCES guacamole_connection (connection_id) ON DELETE CASCADE

);

CREATE INDEX guacamole_sharing_profile_primary_connection_id_index ON guacamole_sharing_profile(primary_connection_id);

--
-- Table of Guacamole sharing profile parameters
--
CREATE TABLE guacamole_sharing_profile_parameter (

  sharing_profile_id INTEGER      NOT NULL,
  parameter_name     VARCHAR(128) NOT NULL,
  parameter_value    VARCHAR(4096) NOT NULL,

  PRIMARY KEY (sharing_profile_id, parameter_name),
  FOREIGN KEY (sharing_profile_id) REFERENCES guacamole_sharing_profile (sharing_profile_id) ON DELETE CASCADE

);

--
-- Table of user permissions
--
CREATE TABLE guacamole_user_permission (

  user_id       INTEGER NOT NULL,
  affected_user_id INTEGER NOT NULL,
  permission    guacamole_object_permission_type NOT NULL,

  PRIMARY KEY (user_id, affected_user_id, permission),

  FOREIGN KEY (user_id) REFERENCES guacamole_user (user_id) ON DELETE CASCADE,
  FOREIGN KEY (affected_user_id) REFERENCES guacamole_user (user_id) ON DELETE CASCADE

);

CREATE INDEX guacamole_user_permission_affected_user_id_index ON guacamole_user_permission(affected_user_id);

--
-- Table of user group permissions
--
CREATE TABLE guacamole_user_group_permission (

  user_group_id       INTEGER NOT NULL,
  affected_user_group_id INTEGER NOT NULL,
  permission          guacamole_object_permission_type NOT NULL,

  PRIMARY KEY (user_group_id, affected_user_group_id, permission),

  FOREIGN KEY (user_group_id) REFERENCES guacamole_user_group (user_group_id) ON DELETE CASCADE,
  FOREIGN KEY (affected_user_group_id) REFERENCES guacamole_user_group (user_group_id) ON DELETE CASCADE

);

CREATE INDEX guacamole_user_group_permission_affected_user_group_id_index ON guacamole_user_group_permission(affected_user_group_id);

--
-- Table of connection permissions
--
CREATE TABLE guacamole_connection_permission (

  user_id       INTEGER NOT NULL,
  connection_id INTEGER NOT NULL,
  permission    guacamole_object_permission_type NOT NULL,

  PRIMARY KEY (user_id, connection_id, permission),
  FOREIGN KEY (user_id) REFERENCES guacamole_user (user_id) ON DELETE CASCADE,
  FOREIGN KEY (connection_id) REFERENCES guacamole_connection (connection_id) ON DELETE CASCADE

);

CREATE INDEX guacamole_connection_permission_connection_id_index ON guacamole_connection_permission(connection_id);

--
-- Table of connection group permissions
--
CREATE TABLE guacamole_connection_group_permission (

  user_id             INTEGER NOT NULL,
  connection_group_id INTEGER NOT NULL,
  permission          guacamole_object_permission_type NOT NULL,

  PRIMARY KEY (user_id, connection_group_id, permission),
  FOREIGN KEY (user_id) REFERENCES guacamole_user (user_id) ON DELETE CASCADE,
  FOREIGN KEY (connection_group_id) REFERENCES guacamole_connection_group (connection_group_id) ON DELETE CASCADE

);

CREATE INDEX guacamole_connection_group_permission_connection_group_id_index ON guacamole_connection_group_permission(connection_group_id);

--
-- Table of sharing profile permissions
--
CREATE TABLE guacamole_sharing_profile_permission (

  user_id            INTEGER NOT NULL,
  sharing_profile_id INTEGER NOT NULL,
  permission         guacamole_object_permission_type NOT NULL,

  PRIMARY KEY (user_id, sharing_profile_id, permission),
  FOREIGN KEY (user_id) REFERENCES guacamole_user (user_id) ON DELETE CASCADE,
  FOREIGN KEY (sharing_profile_id) REFERENCES guacamole_sharing_profile (sharing_profile_id) ON DELETE CASCADE

);

CREATE INDEX guacamole_sharing_profile_permission_sharing_profile_id_index ON guacamole_sharing_profile_permission(sharing_profile_id);

--
-- Table of system permissions
--
CREATE TABLE guacamole_system_permission (

  user_id    INTEGER NOT NULL,
  permission guacamole_system_permission_type NOT NULL,

  PRIMARY KEY (user_id, permission),
  FOREIGN KEY (user_id) REFERENCES guacamole_user (user_id) ON DELETE CASCADE

);

--
-- User login history
--
CREATE TABLE guacamole_user_history (

  history_id      SERIAL                   NOT NULL,
  user_id         INTEGER,
  username        VARCHAR(128)             NOT NULL,
  remote_host     VARCHAR(256),
  start_date      TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date        TIMESTAMP WITH TIME ZONE,

  PRIMARY KEY (history_id),
  FOREIGN KEY (user_id) REFERENCES guacamole_user(user_id) ON DELETE SET NULL

);

CREATE INDEX guacamole_user_history_user_id_index ON guacamole_user_history(user_id);
CREATE INDEX guacamole_user_history_start_date_index ON guacamole_user_history(start_date);
CREATE INDEX guacamole_user_history_end_date_index ON guacamole_user_history(end_date);

--
-- Connection history
--
CREATE TABLE guacamole_connection_history (

  history_id          SERIAL                   NOT NULL,
  user_id             INTEGER,
  username            VARCHAR(128)             NOT NULL,
  connection_id       INTEGER,
  connection_name     VARCHAR(128)             NOT NULL,
  sharing_profile_id  INTEGER,
  sharing_profile_name VARCHAR(128),
  remote_host         VARCHAR(256),
  start_date          TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date            TIMESTAMP WITH TIME ZONE,

  PRIMARY KEY (history_id),
  FOREIGN KEY (user_id) REFERENCES guacamole_user(user_id) ON DELETE SET NULL,
  FOREIGN KEY (connection_id) REFERENCES guacamole_connection(connection_id) ON DELETE SET NULL,
  FOREIGN KEY (sharing_profile_id) REFERENCES guacamole_sharing_profile(sharing_profile_id) ON DELETE SET NULL

);

CREATE INDEX guacamole_connection_history_user_id_index ON guacamole_connection_history(user_id);
CREATE INDEX guacamole_connection_history_connection_id_index ON guacamole_connection_history(connection_id);
CREATE INDEX guacamole_connection_history_sharing_profile_id_index ON guacamole_connection_history(sharing_profile_id);
CREATE INDEX guacamole_connection_history_start_date_index ON guacamole_connection_history(start_date);
CREATE INDEX guacamole_connection_history_end_date_index ON guacamole_connection_history(end_date);

--
-- User groups
--
CREATE TABLE guacamole_user_group (

  user_group_id       SERIAL       NOT NULL,
  user_group_name     VARCHAR(128) NOT NULL,
  disabled            BOOLEAN      NOT NULL DEFAULT FALSE,

  PRIMARY KEY (user_group_id),
  UNIQUE (user_group_name)

);

CREATE INDEX guacamole_user_group_disabled_index ON guacamole_user_group(disabled);

--
-- User group membership
--
CREATE TABLE guacamole_user_group_member (

  user_group_id    INTEGER NOT NULL,
  member_user_id   INTEGER NOT NULL,

  PRIMARY KEY (user_group_id, member_user_id),

  FOREIGN KEY (user_group_id) REFERENCES guacamole_user_group (user_group_id) ON DELETE CASCADE,
  FOREIGN KEY (member_user_id) REFERENCES guacamole_user (user_id) ON DELETE CASCADE

);

CREATE INDEX guacamole_user_group_member_member_user_id_index ON guacamole_user_group_member(member_user_id);

--
-- User group permissions (user)
--
CREATE TABLE guacamole_user_group_permission_user (

  user_group_id    INTEGER NOT NULL,
  member_user_id   INTEGER NOT NULL,
  permission       guacamole_object_permission_type NOT NULL,

  PRIMARY KEY (user_group_id, member_user_id, permission),

  FOREIGN KEY (user_group_id) REFERENCES guacamole_user_group (user_group_id) ON DELETE CASCADE,
  FOREIGN KEY (member_user_id) REFERENCES guacamole_user (user_id) ON DELETE CASCADE

);

CREATE INDEX guacamole_user_group_permission_user_member_user_id_index ON guacamole_user_group_permission_user(member_user_id);

--
-- User group permissions (user group)
--
CREATE TABLE guacamole_user_group_permission_user_group (

  user_group_id          INTEGER NOT NULL,
  member_user_group_id   INTEGER NOT NULL,
  permission             guacamole_object_permission_type NOT NULL,

  PRIMARY KEY (user_group_id, member_user_group_id, permission),

  FOREIGN KEY (user_group_id) REFERENCES guacamole_user_group (user_group_id) ON DELETE CASCADE,
  FOREIGN KEY (member_user_group_id) REFERENCES guacamole_user_group (user_group_id) ON DELETE CASCADE

);

CREATE INDEX guacamole_user_group_permission_user_group_member_user_group_id_index ON guacamole_user_group_permission_user_group(member_user_group_id);

--
-- User group permissions (connection)
--
CREATE TABLE guacamole_user_group_permission_connection (

  user_group_id  INTEGER NOT NULL,
  connection_id  INTEGER NOT NULL,
  permission     guacamole_object_permission_type NOT NULL,

  PRIMARY KEY (user_group_id, connection_id, permission),

  FOREIGN KEY (user_group_id) REFERENCES guacamole_user_group (user_group_id) ON DELETE CASCADE,
  FOREIGN KEY (connection_id) REFERENCES guacamole_connection (connection_id) ON DELETE CASCADE

);

CREATE INDEX guacamole_user_group_permission_connection_connection_id_index ON guacamole_user_group_permission_connection(connection_id);

--
-- User group permissions (connection group)
--
CREATE TABLE guacamole_user_group_permission_connection_group (

  user_group_id       INTEGER NOT NULL,
  connection_group_id INTEGER NOT NULL,
  permission          guacamole_object_permission_type NOT NULL,

  PRIMARY KEY (user_group_id, connection_group_id, permission),

  FOREIGN KEY (user_group_id) REFERENCES guacamole_user_group (user_group_id) ON DELETE CASCADE,
  FOREIGN KEY (connection_group_id) REFERENCES guacamole_connection_group (connection_group_id) ON DELETE CASCADE

);

CREATE INDEX guacamole_user_group_permission_connection_group_connection_group_id_index ON guacamole_user_group_permission_connection_group(connection_group_id);

--
-- User group permissions (sharing profile)
--
CREATE TABLE guacamole_user_group_permission_sharing_profile (

  user_group_id      INTEGER NOT NULL,
  sharing_profile_id INTEGER NOT NULL,
  permission         guacamole_object_permission_type NOT NULL,

  PRIMARY KEY (user_group_id, sharing_profile_id, permission),

  FOREIGN KEY (user_group_id) REFERENCES guacamole_user_group (user_group_id) ON DELETE CASCADE,
  FOREIGN KEY (sharing_profile_id) REFERENCES guacamole_sharing_profile (sharing_profile_id) ON DELETE CASCADE

);

CREATE INDEX guacamole_user_group_permission_sharing_profile_sharing_profile_id_index ON guacamole_user_group_permission_sharing_profile(sharing_profile_id);

--
-- User group permissions (system)
--
CREATE TABLE guacamole_user_group_permission_system (

  user_group_id    INTEGER NOT NULL,
  permission       guacamole_system_permission_type NOT NULL,

  PRIMARY KEY (user_group_id, permission),
  FOREIGN KEY (user_group_id) REFERENCES guacamole_user_group (user_group_id) ON DELETE CASCADE

);

--
-- Add the default user
--
INSERT INTO guacamole_user (username, password_hash, password_date) VALUES ('guacadmin', x'CA458A7D494E3BE824F5E1E175A1556C0F8EEF2C2D7DF3633A518A89C7484E03', NOW());
