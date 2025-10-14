import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { CheckCircle2, XCircle, UserCheck, EyeOff } from 'lucide-react';
import { ConnectedUser } from '@/services/users/userService.js';
import DisableConnectionDialog from './DisableConnectionDialog';

interface ConnectionCardProps {
  connection: ConnectedUser;
  onUpdateStatus?: (
    connectionId: string,
    status: 'accepted' | 'declined' | 'disabled' | 'pending'
  ) => void;
  onDisable?: (connectionId: string) => void;
  variant: 'pending-incoming' | 'pending-outgoing' | 'accepted' | 'disabled';
  onDelete?: (connectionId: string) => void;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  onUpdateStatus,
  onDisable,
  variant,
  onDelete,
}) => {
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);

  const handleDisableConfirmed = () => {
    onDisable?.(connection.id);
    setIsDisableDialogOpen(false);
  };

  const renderBadge = () => {
    switch (variant) {
      case 'pending-incoming':
        return <Badge variant="accent">Pending</Badge>;
      case 'pending-outgoing':
        return <Badge variant="secondary">Waiting</Badge>;
      case 'accepted':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="cursor-default">
                  <UserCheck className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Connected since{' '}
                  {new Date(connection.updated_at).toLocaleDateString()}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'disabled':
        return <Badge variant="outline">Disabled</Badge>;
      default:
        return null;
    }
  };

  const renderActions = () => {
    switch (variant) {
      case 'pending-incoming':
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onUpdateStatus?.(connection.connection_id, 'declined')
              }
            >
              <XCircle className="h-4 w-4 mr-1" />
              Decline
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() =>
                onUpdateStatus?.(connection.connection_id, 'accepted')
              }
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Accept
            </Button>
          </>
        );
      case 'pending-outgoing':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete?.(connection.connection_id)}
          >
            Cancel
          </Button>
        );
      case 'accepted':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDisableDialogOpen(true)}
          >
            <EyeOff className="h-4 w-4 mr-1" />
            Disable
          </Button>
        );
      case 'disabled':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onUpdateStatus?.(connection.connection_id, 'accepted')
            }
          >
            <UserCheck className="h-4 w-4 mr-1" />
            Enable
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card
        data-testid={`connection-card-${connection.invitee_email}`}
        data-variant={variant}
        className={variant === 'disabled' ? 'opacity-60' : ''}
      >
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{connection.name || connection.invitee_email}</span>
            {renderBadge()}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex justify-end gap-2">
          {renderActions()}
        </CardFooter>
      </Card>

      <DisableConnectionDialog
        open={isDisableDialogOpen}
        onOpenChange={setIsDisableDialogOpen}
        onConfirm={handleDisableConfirmed}
        connectionName={connection.name || connection.invitee_email}
      />
    </>
  );
};

export default ConnectionCard;
